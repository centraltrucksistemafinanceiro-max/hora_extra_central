import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User, Role } from '../types';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, onSnapshot, query, getDocs, limit } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  setupRequired: boolean;
  users: User[]; // Full user object for admin panel
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUser: (username: string, password: string, role: Role) => Promise<{success: boolean, error?: string}>;
  setupAdmin: (username: string, password: string) => Promise<{success: boolean, error?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const checkFirstRun = async () => {
      const usersQuery = query(collection(db, "users"), limit(1));
      const snapshot = await getDocs(usersQuery);
      if (snapshot.empty) {
          setSetupRequired(true);
      }
      // Proceed with auth state change listener
      initializeAuthListener();
    };
    checkFirstRun();
  }, []);

  const initializeAuthListener = () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUser({
            uid: firebaseUser.uid,
            username: userData.username,
            role: userData.role
          });
        } else {
          setCurrentUser(null); 
          await signOut(auth);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  };
  
  // Effect to listen for changes in the users collection for the admin panel
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ uid: doc.id, ...doc.data() } as User);
        });
        setUsers(usersData.sort((a,b) => a.username.localeCompare(b.username)));
      });
      return () => unsubscribe();
    } else {
      setUsers([]);
    }
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!username || !password) {
        return { success: false, error: 'Usuário e senha são obrigatórios.' };
    }
    try {
      const email = `${username.toLowerCase()}@centraltruck.app`;
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = 'Ocorreu um erro inesperado.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Usuário ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'O nome de usuário é inválido. Use apenas letras e números.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const addUser = async (username: string, password: string, role: Role): Promise<{success: boolean, error?: string}> => {
    try {
      const email = `${username.toLowerCase()}@centraltruck.app`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Try to create the Firestore document for this user. If that fails,
      // attempt to delete the created Authentication user to avoid orphaned auth accounts.
      try {
        await setDoc(doc(db, 'users', user.uid), {
          username: username.toUpperCase(),
          role: role,
        });
        return { success: true };
      } catch (firestoreError: any) {
        console.error('Failed to write user document, attempting to rollback auth user:', firestoreError);
        try {
          await deleteUser(user);
        } catch (deleteErr) {
          console.error('Failed to delete auth user after Firestore failure:', deleteErr);
        }
        return { success: false, error: 'Falha ao criar usuário (erro ao salvar dados).' };
      }
    } catch (error: any) {
      console.error("Failed to add user:", error);
      if (error.code === 'auth/email-already-in-use') {
          return { success: false, error: "Este nome de usuário já existe." };
      }
       if (error.code === 'auth/weak-password') {
          return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
      }
      if (error.code === 'auth/invalid-email') {
          return { success: false, error: "Nome de usuário inválido. Use apenas letras e números." };
      }
      return { success: false, error: "Falha ao criar usuário." };
    }
  };
  
  const setupAdmin = async (username: string, password: string): Promise<{success: boolean, error?: string}> => {
    // Re-check to prevent race conditions
    const usersQuery = query(collection(db, "users"), limit(1));
    const snapshot = await getDocs(usersQuery);
    if (!snapshot.empty) {
        return { success: false, error: "O administrador já foi configurado." };
    }

    const result = await addUser(username, password, 'admin');
    if (result.success) {
        setSetupRequired(false);
    }
    return result;
  };

  const value = { currentUser, loading, users, login, logout, addUser, setupRequired, setupAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};