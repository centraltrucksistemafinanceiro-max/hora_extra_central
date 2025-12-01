import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types';

interface FormErrors {
  username?: string;
  password?: string;
  role?: string;
}

const Settings: React.FC = () => {
  const { users, addUser } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Usuário é obrigatório.';
    } else if (username.length < 3) {
      newErrors.username = 'Usuário deve ter no mínimo 3 caracteres.';
    }
    if (!password.trim() || password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setRole('user');
    setErrors({});
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await addUser(username, password, role);
    if (result.success) {
      clearForm();
    } else {
      setErrors({ username: result.error });
    }
  };

  return (
      <div className="space-y-8">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </span>
            Adicionar Novo Usuário
          </h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Usuário</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^A-Z0-9]/ig, '').toUpperCase())} className={`uppercase w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white ${errors.username ? 'border-red-500/50' : 'border-slate-700'}`} />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="password"  className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Senha</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white ${errors.password ? 'border-red-500/50' : 'border-slate-700'}`} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Perfil</label>
              <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none">
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-4 mt-4">
                <button type="button" onClick={clearForm} className="px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white">Limpar</button>
                <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl hover:from-sky-400">Adicionar Usuário</button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Usuário</th>
                <th className="p-5">Perfil</th>
                <th className="p-5 text-right">UID do Firebase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map(user => (
                <tr key={user.uid}>
                  <td className="p-5 font-semibold text-white">{user.username}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono text-xs text-slate-500">{user.uid}</td>
                </tr>
              ))}
               {users.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-500 italic bg-slate-900/20">Nenhum usuário encontrado.</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default Settings;