import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import type { Employee, OvertimeRecord } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  employees: Employee[];
  overtimeRecords: OvertimeRecord[];
  loading: boolean;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employeeData: Partial<Omit<Employee, 'id'>>) => Promise<void>;
  addOvertimeRecord: (recordData: Omit<OvertimeRecord, 'id'>) => Promise<void>;
  updateOvertimeRecord: (id: string, recordData: Partial<Omit<OvertimeRecord, 'id'>>) => Promise<void>;
  deleteOvertimeRecord: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setEmployees([]);
      setOvertimeRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const employeesQuery = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(employeesData);
      setLoading(false); // Set loading to false after first data fetch
    }, (error) => {
        console.error("Error fetching employees:", error);
        setLoading(false);
    });
    
    const overtimeQuery = query(collection(db, 'overtimeRecords'), orderBy('date', 'desc'));
    const unsubscribeOvertime = onSnapshot(overtimeQuery, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OvertimeRecord));
      setOvertimeRecords(recordsData);
    }, (error) => {
        console.error("Error fetching overtime records:", error);
    });

    return () => {
      unsubscribeEmployees();
      unsubscribeOvertime();
    };
  }, [currentUser]);

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      await addDoc(collection(db, 'employees'), employeeData);
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw new Error('Falha ao adicionar funcionário.');
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Omit<Employee, 'id'>>) => {
    try {
      await updateDoc(doc(db, 'employees', id), employeeData);
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw new Error('Falha ao atualizar funcionário.');
    }
  };

  const addOvertimeRecord = async (recordData: Omit<OvertimeRecord, 'id'>) => {
    try {
      await addDoc(collection(db, 'overtimeRecords'), recordData);
    } catch (error) {
      console.error('Failed to add overtime record:', error);
      throw new Error('Falha ao adicionar registro de hora extra.');
    }
  };

  const updateOvertimeRecord = async (id: string, recordData: Partial<Omit<OvertimeRecord, 'id'>>) => {
    try {
      await updateDoc(doc(db, 'overtimeRecords', id), recordData);
    } catch (error) {
      console.error('Failed to update overtime record:', error);
      throw new Error('Falha ao atualizar registro de hora extra.');
    }
  };
  
  const deleteOvertimeRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'overtimeRecords', id));
    } catch (error) {
      console.error('Failed to delete overtime record:', error);
      throw new Error('Falha ao remover registro de hora extra.');
    }
  };
  
  const value = {
    employees,
    overtimeRecords,
    loading,
    addEmployee,
    updateEmployee,
    addOvertimeRecord,
    updateOvertimeRecord,
    deleteOvertimeRecord,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
