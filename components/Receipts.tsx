import React, { useState, useMemo } from 'react';
import type { OvertimeRecord, Employee } from '../types';
import { calculateHoursWorked, calculateOvertimeValue } from '../utils/calculations';
import PrintPreview from './PrintPreview';
import { useData } from '../contexts/DataContext';

interface ReceiptsProps {
  isConfidential: boolean;
}

export interface ReceiptSummary {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  totalHours: number;
  totalValue: number;
  lastDate: string;
}

const Receipts: React.FC<ReceiptsProps> = ({ isConfidential }) => {
  const { employees, overtimeRecords } = useData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const receiptSummaries = useMemo<ReceiptSummary[]>(() => {
    const filteredRecords = overtimeRecords
      .filter(record => {
          if (!startDateFilter) return true;
          return record.date >= startDateFilter;
      })
      .filter(record => {
          if (!endDateFilter) return true;
          return record.date <= endDateFilter;
      });

    const summaryMap = new Map<string, ReceiptSummary>();

    filteredRecords.forEach(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      if (!employee) return;

      const hours = calculateHoursWorked(record.startTime, record.endTime);
      const value = calculateOvertimeValue(employee.baseSalary, hours, record.serviceType);

      if (summaryMap.has(employee.id)) {
        const existing = summaryMap.get(employee.id)!;
        existing.totalHours += hours;
        existing.totalValue += value;
        if (record.date > existing.lastDate) {
          existing.lastDate = record.date;
        }
      } else {
        summaryMap.set(employee.id, {
          employeeId: employee.id,
          employeeCode: employee.code,
          employeeName: employee.name,
          totalHours: hours,
          totalValue: value,
          lastDate: record.date
        });
      }
    });

    return Array.from(summaryMap.values()).filter(summary =>
      summary.employeeName.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [overtimeRecords, employees, searchTerm, startDateFilter, endDateFilter]);
  
  const handleSelect = (id: string) => {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
          newSelection.delete(id);
      } else {
          newSelection.add(id);
      }
      setSelectedIds(newSelection);
  };
  
  const handleSelectAll = () => {
    if (selectedIds.size === receiptSummaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(receiptSummaries.map(s => s.employeeId)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const totals = useMemo(() => {
    return receiptSummaries
      .filter(s => selectedIds.has(s.employeeId))
      .reduce((acc, curr) => {
        acc.hours += curr.totalHours;
        acc.value += curr.totalValue;
        return acc;
      }, { hours: 0, value: 0 });
  }, [selectedIds, receiptSummaries]);
  
  const handleGenerateReceipts = () => {
      if (selectedIds.size === 0) {
          alert("Nenhum funcionário selecionado para gerar recibos.");
          return;
      }
      setShowPrintPreview(true);
  };
  
  const selectedSummaries = useMemo(() => {
    return receiptSummaries.filter(s => selectedIds.has(s.employeeId));
  }, [receiptSummaries, selectedIds]);

  return (
    <>
      {showPrintPreview && (
        <PrintPreview 
            summaries={selectedSummaries} 
            onClose={() => setShowPrintPreview(false)}
        />
      )}
      <div className="space-y-8">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
                 <input type="text" placeholder="Buscar por funcionário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value.toUpperCase())} className="uppercase w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600" />
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-slate-500 group-focus-within:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600 [color-scheme:dark]" />
            <input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all hover:border-slate-600 [color-scheme:dark]" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                  <tr>
                  <th className="p-5 w-12 text-center">
                      <input 
                      type="checkbox" 
                      checked={receiptSummaries.length > 0 && selectedIds.size === receiptSummaries.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-offset-slate-900 focus:ring-sky-500"
                      />
                  </th>
                  <th className="p-5">#</th>
                  <th className="p-5">Funcionário</th>
                  <th className="p-5 text-right">Total Horas</th>
                  <th className="p-5 text-right">Total Valor</th>
                  <th className="p-5 text-right">Última Data</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                  {receiptSummaries.map((summary, index) => (
                  <tr key={summary.employeeId} className={`transition-all duration-200 ${selectedIds.has(summary.employeeId) ? 'bg-sky-500/10' : 'hover:bg-white/5'}`}>
                      <td className="p-5 text-center">
                          <input type="checkbox" checked={selectedIds.has(summary.employeeId)} onChange={() => handleSelect(summary.employeeId)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-offset-slate-900 focus:ring-sky-500 cursor-pointer" />
                      </td>
                      <td className="p-5 text-slate-500">{index + 1}</td>
                      <td className={`p-5 font-semibold text-white ${selectedIds.has(summary.employeeId) ? 'text-sky-400' : ''}`}>{summary.employeeName}</td>
                      <td className="p-5 text-right font-mono text-slate-300">{summary.totalHours.toFixed(2)}</td>
                      <td className="p-5 text-right font-mono font-bold text-emerald-400">{isConfidential ? 'R$ ••••••' : formatCurrency(summary.totalValue)}</td>
                      <td className="p-5 text-right text-slate-400">{new Date(summary.lastDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  </tr>
                  ))}
                   {receiptSummaries.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-500 italic bg-slate-900/20">Nenhum registro para exibir.</td>
                        </tr>
                    )}
              </tbody>
              </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-4">
              <button onClick={handleGenerateReceipts} className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                  Gerar Recibos
              </button>
              <button onClick={handleSelectAll} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-3 px-5 rounded-xl transition-all hover:border-slate-500 hover:text-white">
                {receiptSummaries.length > 0 && selectedIds.size === receiptSummaries.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              <button onClick={clearSelection} className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-medium py-3 px-5 rounded-xl transition-all">Limpar Seleção</button>
          </div>
          <div className="text-right flex gap-10 border-l border-slate-800 pl-8">
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Horas</p>
                <p className="font-mono text-2xl text-white">{totals.hours.toFixed(2)}</p>
             </div>
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Valor Total</p>
                <p className="font-mono text-2xl text-emerald-400 font-bold tracking-tight">{isConfidential ? '••••••' : formatCurrency(totals.value)}</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipts;