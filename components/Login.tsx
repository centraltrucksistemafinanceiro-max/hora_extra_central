import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Usuário ou senha inválidos.');
    }
    // Persist username if rememberMe is checked
    try {
      if (rememberMe && username) {
        localStorage.setItem('he_username', username);
        localStorage.setItem('he_remember', '1');
      } else {
        localStorage.removeItem('he_username');
        localStorage.removeItem('he_remember');
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('he_username');
      const storedRemember = localStorage.getItem('he_remember');
      if (stored) setUsername(stored);
      if (storedRemember === '1') setRememberMe(true);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-slate-950 p-3.5 rounded-2xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 tracking-tight">
            Central<span className="text-white">Truck</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest mt-2">Gestão de Horas Extras</p>
          <div className="flex justify-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Main form card */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-full blur-2xl -z-10"></div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Bem-vindo</h2>
              <p className="text-sm text-slate-400 mt-1">Acesse sua conta para gerenciar horas extras, gerar relatórios e imprimir recibos com segurança.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <div className="group/field">
                <label htmlFor="username" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">Usuário</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/60 group-focus-within/field:text-sky-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12a3 3 0 100-6 3 3 0 000 6z"/><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 16c1.656 0 3.215-.331 4.649-.948a8.001 8.001 0 10-9.298 0C8.785 17.669 10.344 18 12 18z"/>
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^A-Z0-9]/ig, '').toUpperCase())}
                    required
                    placeholder="Digite seu usuário"
                    className="uppercase w-full bg-slate-800/50 border border-slate-600/30 hover:border-sky-500/30 focus:border-sky-500 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="group/field">
                <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/60 group-focus-within/field:text-indigo-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                    className="w-full bg-slate-800/50 border border-slate-600/30 hover:border-indigo-500/30 focus:border-indigo-500 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 011.175-4.724M6.18 6.18A7.5 7.5 0 0112 5.25c3.866 0 7.05 2.73 7.82 6.18M3 3l18 18"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer group/checkbox">
                  <div className="relative">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
                    <div className="w-5 h-5 bg-slate-700 border border-slate-600 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-indigo-600 peer-checked:border-sky-500 transition-all duration-300"></div>
                    <svg className="absolute top-1 left-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="group-hover/checkbox:text-slate-200 transition">Lembrar de mim</span>
                </label>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                  Esqueceu a senha?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-shake">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn mt-6"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition duration-1000 group-hover/btn:duration-200 group-disabled/btn:opacity-50"></div>
                <div className="relative bg-slate-950 hover:bg-slate-900 disabled:bg-slate-950 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-white"></div>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Decorative footer */}
            <div className="mt-6 pt-6 border-t border-slate-700/30">
              <p className="text-center text-xs text-slate-500">
                Sistema seguro de gestão de horas extras • Acesso restrito
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recuperar Senha
            </h3>
            <p className="text-slate-300 mb-6">
              Para redefinir sua senha, entre em contato com o <span className="font-semibold text-white">ADMINISTRADOR</span> do sistema.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowForgotModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                Fechar
              </button>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;