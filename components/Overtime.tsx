import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { OvertimeRecord, Employee, ServiceType } from '../types';
import { calculateHoursWorked, calculateOvertimeValue } from '../utils/calculations';
import ConfirmationModal from './ConfirmationModal';
import BatchOvertimeModal from './BatchOvertimeModal';
import PrintPreviewOvertime from './PrintPreviewOvertime';
import { useData } from '../contexts/DataContext';

declare const XLSX: any;

interface OvertimeProps {
  isConfidential: boolean;
}

interface FormErrors {
    employeeId?: string;
    date?: string;
    time?: string;
}

type SortKey = keyof OvertimeRecord | 'employeeName' | 'value' | 'Horas' | '#';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const InputField: React.FC<{ label: string, children: React.ReactNode, error?: string }> = ({ label, children, error }) => (
  <div className="flex flex-col group">
    <label className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide group-focus-within:text-sky-400 transition-colors">{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1 animate-pulse flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {error}
    </p>}
  </div>
);

const Overtime: React.FC<OvertimeProps> = ({ isConfidential }) => {
  const { employees, overtimeRecords, addOvertimeRecord, updateOvertimeRecord, deleteOvertimeRecord } = useData();
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeNameInput, setEmployeeNameInput] = useState('');
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsListRef = useRef<HTMLUListElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [serviceType, setServiceType] = useState<ServiceType>('60%');
  const [observation, setObservation] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const hoursWorked = useMemo(() => calculateHoursWorked(startTime, endTime), [startTime, endTime]);
  
  const totalValue = useMemo(() => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      return calculateOvertimeValue(employee.baseSalary, hoursWorked, serviceType);
    }
    return 0;
  }, [employeeId, hoursWorked, serviceType, employees]);

  const employeeSuggestions = useMemo(() => {
    if (!employeeNameInput) {
        return [];
    }
    const search = employeeNameInput.toUpperCase();
    return employees.filter(
        emp => emp.isActive && emp.name.toUpperCase().includes(search)
    );
  }, [employeeNameInput, employees]);

  useEffect(() => {
    if (highlightedIndex > -1 && suggestionsListRef.current) {
        const item = suggestionsListRef.current.children[highlightedIndex] as HTMLLIElement;
        item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  const handleEmployeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showEmployeeSuggestions && employeeSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % employeeSuggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + employeeSuggestions.length) % employeeSuggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex > -1) {
                const selectedEmp = employeeSuggestions[highlightedIndex];
                setEmployeeId(selectedEmp.id);
                setEmployeeNameInput(selectedEmp.name);
                setShowEmployeeSuggestions(false);
                setHighlightedIndex(-1);
            } else {
                const exactMatch = employeeSuggestions.find(emp => emp.name.toUpperCase() === employeeNameInput.toUpperCase());
                if (exactMatch) {
                    setEmployeeId(exactMatch.id);
                    setEmployeeNameInput(exactMatch.name);
                    setShowEmployeeSuggestions(false);
                    setHighlightedIndex(-1);
                }
            }
        } else if (e.key === 'Escape') {
            setShowEmployeeSuggestions(false);
            setHighlightedIndex(-1);
        }
    }
  };

  const handleEmployeeInputBlur = () => {
    setTimeout(() => {
        const exactMatch = employees.find(emp => emp.isActive && emp.name.toUpperCase() === employeeNameInput.toUpperCase());
        if (exactMatch) {
            setEmployeeId(exactMatch.id);
            setEmployeeNameInput(exactMatch.name);
        }
        setShowEmployeeSuggestions(false);
        setHighlightedIndex(-1);
    }, 200);
  };


  const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      if (!employeeId) newErrors.employeeId = 'Selecione um funcionário válido.';
      if (!date) newErrors.date = 'Data é obrigatória.';
      if (hoursWorked <= 0) newErrors.time = 'Hora de fim deve ser maior que a de início.';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Desconhecido';

  const resetForm = () => {
    setSelectedRecord(null);
    setEmployeeId('');
    setEmployeeNameInput('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('00:00');
    setEndTime('00:00');
    setServiceType('60%');
    setObservation('');
    setErrors({});
  };

  const clearForNextEntry = () => {
    setSelectedRecord(null);
    setStartTime('00:00');
    setEndTime('00:00');
    setObservation('');
    setErrors({});
    setTimeout(() => {
        startTimeRef.current?.focus();
    }, 0);
  };
  
  const handleSelectRecord = (record: OvertimeRecord) => {
    setSelectedRecord(record);
    setEmployeeId(record.employeeId);
    setEmployeeNameInput(getEmployeeName(record.employeeId));
    setDate(record.date);
    setStartTime(record.startTime);
    setEndTime(record.endTime);
    setServiceType(record.serviceType);
    setObservation(record.observation);
    setErrors({});
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    const newRecordData: Omit<OvertimeRecord, 'id'> = {
      employeeId: employeeId,
      date,
      startTime,
      endTime,
      serviceType,
      observation,
    };
    await addOvertimeRecord(newRecordData);
    clearForNextEntry();
  };
  
  const handleEdit = async () => {
    if (!selectedRecord) return;
    if (!validateForm()) return;
    
    await updateOvertimeRecord(selectedRecord.id, {
      employeeId: employeeId,
      date,
      startTime,
      endTime,
      serviceType,
      observation,
    });
    resetForm();
  };

  const handleRemove = () => {
    if (selectedRecord) {
        setIsDeleteModalOpen(true);
    }
  };

  const confirmRemove = async () => {
      if (!selectedRecord) return;
      await deleteOvertimeRecord(selectedRecord.id);
      setIsDeleteModalOpen(false);
      resetForm();
  };
  
  const handleBatchAdd = async (newRecordsData: Omit<OvertimeRecord, 'id'>[]) => {
    const promises = newRecordsData.map(record => addOvertimeRecord(record));
    await Promise.all(promises);
    setIsBatchModalOpen(false);
  };


  const filteredRecords = useMemo(() => {
    return overtimeRecords
    .filter(record => {
        const employee = employees.find(e => e.id === record.employeeId);
        if (!employee) return false;
        return employee.name.toUpperCase().includes(searchTerm.toUpperCase());
    })
    .filter(record => {
        if (!startDateFilter) return true;
        return record.date >= startDateFilter;
    })
    .filter(record => {
        if (!endDateFilter) return true;
        return record.date <= endDateFilter;
    });
  }, [overtimeRecords, employees, searchTerm, startDateFilter, endDateFilter]);
  
  const sortedAndFilteredRecords = useMemo(() => {
    let sortableItems = [...filteredRecords];
    
    sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        const key = sortConfig.key;

        if (key === 'employeeName') {
            aValue = getEmployeeName(a.employeeId);
            bValue = getEmployeeName(b.employeeId);
        } else if (key === 'value') {
            const employeeA = employees.find(e => e.id === a.employeeId);
            aValue = calculateOvertimeValue(employeeA?.baseSalary || 0, calculateHoursWorked(a.startTime, a.endTime), a.serviceType);
            
            const employeeB = employees.find(e => e.id === b.employeeId);
            bValue = calculateOvertimeValue(employeeB?.baseSalary || 0, calculateHoursWorked(b.startTime, b.endTime), b.serviceType);
        } else if (key === 'Horas') {
             aValue = calculateHoursWorked(a.startTime, a.endTime);
             bValue = calculateHoursWorked(b.startTime, b.endTime);
        } else if (key === '#') {
             return 0;
        } else {
            aValue = a[key as keyof OvertimeRecord];
            bValue = b[key as keyof OvertimeRecord];
        }
        
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else if (key === 'date') {
            comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        } else {
            comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { sensitivity: 'base' });
        }

        return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
    
    return sortableItems;
}, [filteredRecords, sortConfig, employees]);

const requestSort = (key: SortKey) => {
    if (key === '#') return;
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
};

  const handleExportXLSX = () => {
    if (sortedAndFilteredRecords.length === 0) {
      alert("Não há registros filtrados para exportar.");
      return;
    }

    const dataToExport = sortedAndFilteredRecords.map(record => {
        const employee = employees.find(e => e.id === record.employeeId);
        const hours = calculateHoursWorked(record.startTime, record.endTime);
        const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);

        const [year, month, day] = record.date.split('-').map(Number);
        const jsDate = new Date(Date.UTC(year, month - 1, day));

        return {
            'Funcionário': employee?.name || 'Desconhecido',
            'Data': jsDate,
            'Início': record.startTime,
            'Fim': record.endTime,
            'Horas': parseFloat(hours.toFixed(2)),
            'Tipo': record.serviceType,
            'Observação': record.observation,
            'Valor Total (R$)': parseFloat(value.toFixed(2)),
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    worksheet['!cols'] = [
      { wch: 25 }, // Funcionário
      { wch: 12 }, // Data
      { wch: 8 },  // Início
      { wch: 8 },  // Fim
      { wch: 8 },  // Horas
      { wch: 8 },  // Tipo
      { wch: 30 }, // Observação
      { wch: 18 }, // Valor Total (R$)
    ];
    
    dataToExport.forEach((_row, index) => {
        const rowIndex = index + 2;
        const currencyCellRef = `H${rowIndex}`;
        if(worksheet[currencyCellRef]) {
            worksheet[currencyCellRef].z = '"R$" #,##0.00';
        }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Horas Extras");

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Relatorio_Horas_Extras_${today}.xlsx`);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  return (
    <>
      <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmRemove}
          title="Confirmar Remoção"
      >
          <p>Você tem certeza que deseja remover este registro de hora extra do funcionário <span className="font-bold text-white">{getEmployeeName(selectedRecord?.employeeId ?? '')}</span>?</p>
          <p className="text-sm text-slate-400 mt-2">Esta ação não pode ser desfeita.</p>
      </ConfirmationModal>

      <BatchOvertimeModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImport={handleBatchAdd}
        employees={employees}
      />

      {isPrintPreviewOpen && (
        <PrintPreviewOvertime
          records={sortedAndFilteredRecords}
          employees={employees}
          onClose={() => setIsPrintPreviewOpen(false)}
          startDate={startDateFilter}
          endDate={endDateFilter}
        />
      )}

      <div className="space-y-8">
      
      {/* Filters Section */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros de Pesquisa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
              <input type="text" placeholder="Buscar por funcionário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value.toUpperCase())} className="uppercase w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-slate-500 group-focus-within:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="group">
            <input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600 [color-scheme:dark]" />
          </div>
          <div className="group">
            <input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600 [color-scheme:dark]" />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            </span>
            Lançar Hora Extra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField label="Funcionário" error={errors.employeeId}>
                <div className="relative">
                    <input
                        type="text"
                        value={employeeNameInput}
                        onChange={(e) => {
                            setEmployeeNameInput(e.target.value.toUpperCase());
                            setEmployeeId('');
                            setShowEmployeeSuggestions(true);
                            setHighlightedIndex(-1);
                        }}
                        onKeyDown={handleEmployeeKeyDown}
                        onFocus={() => {
                            setHighlightedIndex(-1);
                            setShowEmployeeSuggestions(true);
                        }}
                        onBlur={handleEmployeeInputBlur}
                        placeholder="Digite para buscar..."
                        autoComplete="off"
                        className={`uppercase w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner ${errors.employeeId ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`}
                    />
                    {showEmployeeSuggestions && employeeSuggestions.length > 0 && (
                        <ul ref={suggestionsListRef} className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl max-h-56 overflow-y-auto shadow-2xl ring-1 ring-black/20">
                            {employeeSuggestions.map((emp, index) => (
                                <li
                                    key={emp.id}
                                    onMouseDown={() => {
                                        setEmployeeId(emp.id);
                                        setEmployeeNameInput(emp.name);
                                        setShowEmployeeSuggestions(false);
                                        setHighlightedIndex(-1);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`px-4 py-3 text-sm text-slate-200 cursor-pointer transition-colors ${
                                        index === highlightedIndex ? 'bg-sky-500/20 text-sky-100' : 'hover:bg-slate-700/50'
                                    }`}
                                >
                                    {emp.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </InputField>
            <InputField label="Data" error={errors.date}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all shadow-inner [color-scheme:dark] ${errors.date ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
            </InputField>
            <InputField label="Hora Início">
                <input ref={startTimeRef} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all shadow-inner [color-scheme:dark] ${errors.time ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
            </InputField>
            <InputField label="Hora Fim">
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all shadow-inner [color-scheme:dark] ${errors.time ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:border-sky-500/50 focus:ring-sky-500/30'}`} />
            </InputField>
            
            <InputField label="Horas Calculadas" error={errors.time}>
                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 shadow-inner">
                    <span className="text-amber-500 font-bold font-mono text-lg">{hoursWorked.toFixed(2)}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold mt-1">Horas</span>
                </div>
            </InputField>
            <InputField label="Tipo de Serviço">
                <div className="relative">
                    <select value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:border-sky-500/50 focus:ring-sky-500/30 transition-all shadow-inner appearance-none cursor-pointer">
                        <option value="60%">Hora Extra 60%</option>
                        <option value="100%">Hora Extra 100%</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </InputField>
            <div className="md:col-span-2 lg:col-span-1">
                <InputField label="Observação">
                    <input type="text" value={observation} onChange={e => setObservation(e.target.value.toUpperCase())} placeholder="Ex: Aux. Oficina" className="uppercase w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:border-sky-500/50 focus:ring-sky-500/30 transition-all shadow-inner" />
                </InputField>
            </div>
            <InputField label="Valor Estimado">
                 <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 shadow-inner">
                    <span className="text-emerald-400 font-bold font-mono text-lg truncate">
                         {isConfidential ? 'R$ ••••••' : formatCurrency(totalValue)}
                    </span>
                </div>
            </InputField>
        </div>

        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-800">
            <button onClick={handleAdd} className="flex-1 min-w-[140px] bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-900/20 transition-all transform hover:-translate-y-0.5">Adicionar</button>
            <button onClick={() => setIsBatchModalOpen(true)} className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all hover:border-slate-500 hover:text-white">Importar Lote</button>
            <button onClick={handleExportXLSX} className="flex-1 min-w-[140px] bg-emerald-900/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold py-3 px-6 rounded-xl transition-all">Exportar Excel</button>
            <button onClick={() => setIsPrintPreviewOpen(true)} className="flex-1 min-w-[140px] bg-indigo-900/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 font-semibold py-3 px-6 rounded-xl transition-all">Imprimir</button>
            <button onClick={handleEdit} disabled={!selectedRecord} className="flex-1 min-w-[140px] bg-amber-500/10 border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Editar</button>
            <button onClick={handleRemove} disabled={!selectedRecord} className="flex-1 min-w-[140px] bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Remover</button>
            <button onClick={resetForm} className="flex-1 min-w-[140px] text-slate-400 hover:text-white hover:bg-white/5 font-medium py-3 px-6 rounded-xl transition-colors">Cancelar</button>
        </div>
      </div>
      
      {/* Table Section */}
       <div className="space-y-5">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
            Histórico de Lançamentos
        </h3>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-5 whitespace-nowrap">#</th>
                      {[
                        { label: 'Funcionário', key: 'employeeName' },
                        { label: 'Data', key: 'date' },
                        { label: 'Início', key: 'startTime' },
                        { label: 'Fim', key: 'endTime' },
                        { label: 'Horas', key: 'Horas' },
                        { label: 'Tipo', key: 'serviceType' },
                        { label: 'Observação', key: 'observation' },
                        { label: 'Valor', key: 'value' },
                      ].map(({ label, key }) => (
                        <th key={key} className="p-5 whitespace-nowrap">
                          <button 
                            onClick={() => requestSort(key as SortKey)} 
                            className="flex items-center gap-1.5 transition-colors hover:text-white focus:outline-none"
                          >
                            {label}
                            {sortConfig.key === key && (
                              <span className="text-sky-400">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                            )}
                          </button>
                        </th>
                      ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {sortedAndFilteredRecords.map((record, index) => {
                        const isSelected = selectedRecord?.id === record.id;
                        return (
                            <tr key={record.id} onClick={() => handleSelectRecord(record)} className={`group cursor-pointer transition-all duration-200 ${isSelected ? 'bg-sky-500/10' : 'hover:bg-white/5'}`}>
                                <td className="p-5 text-slate-500 group-hover:text-slate-400">{index+1}</td>
                                <td className={`p-5 font-semibold text-white ${isSelected ? 'text-sky-400' : ''}`}>{getEmployeeName(record.employeeId)}</td>
                                <td className="p-5">{new Date(record.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="p-5 font-mono text-slate-400">{record.startTime}</td>
                                <td className="p-5 font-mono text-slate-400">{record.endTime}</td>
                                <td className="p-5 font-mono font-bold text-slate-200">{calculateHoursWorked(record.startTime, record.endTime).toFixed(2)}</td>
                                <td className="p-5">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm ${record.serviceType === '100%' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-indigo-500/10' : 'bg-sky-500/10 text-sky-300 border-sky-500/20 shadow-sky-500/10'}`}>
                                        {record.serviceType}
                                    </span>
                                </td>
                                <td className="p-5 text-slate-400 italic max-w-xs truncate">{record.observation || '-'}</td>
                                <td className="p-5 font-mono font-medium text-emerald-400">{isConfidential ? '••••••' : formatCurrency(calculateOvertimeValue(employees.find(e=>e.id===record.employeeId)?.baseSalary || 0, calculateHoursWorked(record.startTime, record.endTime), record.serviceType))}</td>
                            </tr>
                        )
                    })}
                     {sortedAndFilteredRecords.length === 0 && (
                        <tr>
                            <td colSpan={9} className="p-12 text-center text-slate-500 italic bg-slate-900/20">Nenhum registro encontrado.</td>
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

export default Overtime;