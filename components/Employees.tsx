import React, { useState, useMemo } from 'react';
import type { Employee } from '../types';
import ConfirmationModal from './ConfirmationModal';
import BatchEmployeeModal from './BatchEmployeeModal';
import { useData } from '../contexts/DataContext';

interface EmployeesProps {
  isConfidential: boolean;
}

interface FormErrors {
    code?: string;
    name?: string;
    baseSalary?: string;
}

declare const XLSX: any;

const Employees: React.FC<EmployeesProps> = ({ isConfidential }) => {
  const { employees, addEmployee, updateEmployee } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      if (!code.trim()) newErrors.code = 'Código é obrigatório.';
      if (!name.trim()) newErrors.name = 'Nome é obrigatório.';
      if (!baseSalary || isNaN(parseFloat(baseSalary)) || parseFloat(baseSalary) <= 0) {
          newErrors.baseSalary = 'Salário deve ser um número positivo.';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const clearForm = () => {
    setSelectedEmployee(null);
    setCode('');
    setName('');
    setBaseSalary('');
    setErrors({});
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCode(employee.code);
    setName(employee.name);
    setBaseSalary(String(employee.baseSalary));
    setErrors({});
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    const newEmployeeData: Omit<Employee, 'id'> = {
      code,
      name,
      baseSalary: parseFloat(baseSalary),
      isActive: true,
    };
    await addEmployee(newEmployeeData);
    clearForm();
  };
  
  const handleEdit = async () => {
    if (!selectedEmployee) return;
    if (!validateForm()) return;

    await updateEmployee(selectedEmployee.id, { code, name, baseSalary: parseFloat(baseSalary) });
    clearForm();
  };

  const handleToggleStatus = () => {
    if (selectedEmployee) {
        setIsDeleteModalOpen(true);
    }
  };
  
  const confirmToggleStatus = async () => {
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, { isActive: !selectedEmployee.isActive });
    setIsDeleteModalOpen(false);
    clearForm();
  };

  const handleBatchAddEmployees = async (newEmployeesData: Omit<Employee, 'id' | 'isActive'>[]) => {
    const promises = newEmployeesData.map(empData => addEmployee({ ...empData, isActive: true }));
    await Promise.all(promises);
    setIsBatchModalOpen(false);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'active' ? emp.isActive : !emp.isActive;
    }).sort((a, b) => a.code.localeCompare(b.code));
  }, [employees, statusFilter]);

  const handleExportXLSX = () => {
    if (filteredEmployees.length === 0) {
        alert("Não há funcionários para exportar com o filtro atual.");
        return;
    }

    const dataToExport = filteredEmployees.map(emp => {
        const hourlyRate = emp.baseSalary / 220;
        const rate60 = hourlyRate * 1.6;
        const rate100 = hourlyRate * 2.0;

        if (isConfidential) {
            return {
                'Código': emp.code,
                'Nome': emp.name,
                'Status': emp.isActive ? 'Ativo' : 'Inativo',
                'Salário Base (R$)': '••••••',
                'Hora Mensal': 220,
                'Valor por Hora (R$)': '••••••',
                'Valor Hora 60% (R$)': '••••••',
                'Valor Hora 100% (R$)': '••••••',
            };
        }

        return {
            'Código': emp.code,
            'Nome': emp.name,
            'Status': emp.isActive ? 'Ativo' : 'Inativo',
            'Salário Base (R$)': parseFloat(emp.baseSalary.toFixed(2)),
            'Hora Mensal': 220,
            'Valor por Hora (R$)': parseFloat(hourlyRate.toFixed(2)),
            'Valor Hora 60% (R$)': parseFloat(rate60.toFixed(2)),
            'Valor Hora 100% (R$)': parseFloat(rate100.toFixed(2)),
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    worksheet['!cols'] = [
        { wch: 10 }, // Código
        { wch: 30 }, // Nome
        { wch: 10 }, // Status
        { wch: 20 }, // Salário Base (R$)
        { wch: 15 }, // Hora Mensal
        { wch: 20 }, // Valor por Hora (R$)
        { wch: 20 }, // Valor Hora 60% (R$)
        { wch: 20 }, // Valor Hora 100% (R$)
    ];

    if (!isConfidential) {
        dataToExport.forEach((_row, index) => {
            const rowIndex = index + 2;
            const currencyColumns = ['D', 'F', 'G', 'H'];
            currencyColumns.forEach(col => {
                const cellRef = `${col}${rowIndex}`;
                if (worksheet[cellRef]) {
                    worksheet[cellRef].z = '"R$" #,##0.00';
                }
            });
        });
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Funcionários");

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Relatorio_Funcionarios_${today}.xlsx`);
  };

  const InputField: React.FC<{ label: string, id: string, children: React.ReactNode, error?: string }> = ({ label, id, children, error }) => (
    <div className="group">
      <label htmlFor={id} className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide group-focus-within:text-sky-400 transition-colors">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 animate-pulse flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {error}
      </p>}
    </div>
  );
  
  return (
    <>
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmToggleStatus}
            title={`Confirmar Alteração de Status`}
        >
            <p>Você tem certeza que deseja {selectedEmployee?.isActive ? 'INATIVAR' : 'ATIVAR'} o funcionário <span className="font-bold text-white">{selectedEmployee?.name}</span>?</p>
        </ConfirmationModal>

        <BatchEmployeeModal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onImport={handleBatchAddEmployees}
            existingEmployees={employees}
        />

        <div className="space-y-8">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                </span>
                Gerenciar Funcionário
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <InputField label="Código" id="emp-code" error={errors.code}>
                    <input id="emp-code" type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: 101" className={`uppercase w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner ${errors.code ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
                </InputField>
                <InputField label="Nome Completo" id="emp-name" error={errors.name}>
                    <input id="emp-name" type="text" value={name} onChange={e => setName(e.target.value.toUpperCase())} placeholder="Ex: João da Silva" className={`uppercase w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
                </InputField>
                <InputField label="Salário Base (R$)" id="emp-salary" error={errors.baseSalary}>
                    <input id="emp-salary" type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder="Ex: 1500.00" className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner ${errors.baseSalary ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
                </InputField>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-800">
                <button onClick={handleAdd} className="flex-1 min-w-[140px] bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0">Adicionar</button>
                <button onClick={() => setIsBatchModalOpen(true)} className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all hover:border-slate-500 hover:text-white">Importar Lote</button>
                <button onClick={handleEdit} disabled={!selectedEmployee} className="flex-1 min-w-[140px] bg-amber-500/10 border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Editar</button>
                <button onClick={handleToggleStatus} disabled={!selectedEmployee} className={`flex-1 min-w-[140px] border font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedEmployee?.isActive ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}>
                    {selectedEmployee?.isActive ? 'Inativar' : 'Ativar'}
                </button>
                <button onClick={handleExportXLSX} className="flex-1 min-w-[140px] bg-emerald-900/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold py-3 px-6 rounded-xl transition-all">Exportar Excel</button>
                <button onClick={clearForm} className="flex-1 min-w-[140px] text-slate-400 hover:text-white hover:bg-white/5 font-medium py-3 px-6 rounded-xl transition-colors">Cancelar</button>
            </div>
        </div>
        
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    Lista de Funcionários
                </h3>
                <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                    {(['active', 'inactive', 'all'] as const).map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${statusFilter === status ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}>
                            {status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Todos'}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="p-5 pl-8">Código</th>
                            <th className="p-5">Nome</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Salário</th>
                            <th className="p-5 text-right">Hora Mensal</th>
                            <th className="p-5 text-right">Por Hora</th>
                            <th className="p-5 text-right">60%</th>
                            <th className="p-5 text-right pr-8">100%</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredEmployees.map((emp) => {
                            const hourlyRate = emp.baseSalary / 220;
                            const isSelected = selectedEmployee?.id === emp.id;
                            return (
                                <tr key={emp.id} onClick={() => handleSelectEmployee(emp)} className={`group cursor-pointer transition-all duration-200 ${isSelected ? 'bg-sky-500/10' : 'hover:bg-white/5'} ${!emp.isActive ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="p-5 pl-8 font-mono text-slate-400 group-hover:text-sky-300 transition-colors">{emp.code}</td>
                                    <td className={`p-5 font-semibold text-white ${isSelected ? 'text-sky-400' : ''}`}>{emp.name}</td>
                                    <td className="p-5">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${emp.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {emp.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                    </td>
                                    <td className="p-5 text-right font-mono text-slate-300">{isConfidential ? '••••••' : formatCurrency(emp.baseSalary)}</td>
                                    <td className="p-5 text-right font-mono text-slate-400">220</td>
                                    <td className="p-5 text-right font-mono text-slate-400">{isConfidential ? '••••••' : formatCurrency(hourlyRate)}</td>
                                    <td className="p-5 text-right font-mono text-sky-400 font-medium">{isConfidential ? '••••••' : formatCurrency(hourlyRate * 1.6)}</td>
                                    <td className="p-5 text-right pr-8 font-mono text-indigo-400 font-medium">{isConfidential ? '••••••' : formatCurrency(hourlyRate * 2.0)}</td>
                                </tr>
                            );
                        })}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-slate-500 italic bg-slate-900/20">Nenhum funcionário encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    </>
  );
};

export default Employees;