import React from 'react';
import type { Tab } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isConfidential: boolean;
  setIsConfidential: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isConfidential, setIsConfidential }) => {
  const { currentUser, logout } = useAuth();

  const baseTabs: Tab[] = ['Início', 'Funcionários', 'Hora Extra', 'Recibos'];
  const tabs: Tab[] = currentUser?.role === 'admin' ? [...baseTabs, 'Configurações'] : baseTabs;

  const tabIcons: Record<Tab, React.ReactNode> = {
    'Início': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    'Funcionários': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125" />
      </svg>
    ),
    'Hora Extra': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Recibos': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'Configurações': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-sky-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Central<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Truck</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gestão de Horas Extras</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button
                onClick={() => setIsConfidential(!isConfidential)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isConfidential ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={isConfidential ? "Mostrar valores" : "Ocultar valores"}
            >
                {isConfidential ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-2.201-4.209a3 3 0 00-4.243-4.243" />
                        </svg>
                        <span className="text-sm font-medium">Valores Ocultos</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-medium">Valores Visíveis</span>
                    </>
                )}
            </button>
            <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                title="Sair do sistema"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                 <span className="text-sm font-medium">Sair</span>
            </button>
        </div>
      </div>

      <nav className="bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/60 shadow-xl flex flex-col sm:flex-row gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative w-full px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              activeTab === tab
                ? 'bg-slate-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/5'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {activeTab === tab && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 opacity-100"></div>
            )}
            <div className="flex items-center justify-center gap-2 relative z-10">
                {tabIcons[tab]}
                {tab}
            </div>
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;