import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Overtime from './components/Overtime';
import Receipts from './components/Receipts';
import Settings from './components/Settings';
import Login from './components/Login';
import AdminSetup from './components/AdminSetup';
import type { User } from './types';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';

export type Tab = 'Início' | 'Funcionários' | 'Hora Extra' | 'Recibos' | 'Configurações';

const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
    </div>
);

const MainLayout: React.FC<{currentUser: User}> = ({currentUser}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Início');
  const [isConfidential, setIsConfidential] = useState<boolean>(false);
  const { employees, overtimeRecords, loading } = useData();

  const renderContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div></div>;
    }
    
    switch (activeTab) {
      case 'Início':
        return <Dashboard employees={employees} overtimeRecords={overtimeRecords} isConfidential={isConfidential} />;
      case 'Funcionários':
        return <Employees isConfidential={isConfidential} />;
      case 'Hora Extra':
        return <Overtime isConfidential={isConfidential} />;
      case 'Recibos':
        return <Receipts isConfidential={isConfidential} />;
      case 'Configurações':
        if (currentUser.role === 'admin') {
            return <Settings />;
        }
        // Fallback for non-admin users trying to access settings
        setActiveTab('Início');
        return <Dashboard employees={employees} overtimeRecords={overtimeRecords} isConfidential={isConfidential} />;
      default:
        return <Dashboard employees={employees} overtimeRecords={overtimeRecords} isConfidential={isConfidential} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isConfidential={isConfidential}
          setIsConfidential={setIsConfidential}
        />
        <main className="mt-8 animate-fade-in-up">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, loading, setupRequired } = useAuth();
  
  if (loading) {
      return <LoadingSpinner />;
  }

  if (setupRequired) {
    return <AdminSetup />;
  }
  
  if (!currentUser) {
    return <Login />;
  }

  return <MainLayout currentUser={currentUser} />;
}

export default App;