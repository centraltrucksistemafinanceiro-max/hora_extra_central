import React from 'react';
import type { OvertimeRecord, Employee } from '../types';
import { calculateHoursWorked, calculateOvertimeValue } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PrintPreviewOvertimeProps {
  records: OvertimeRecord[];
  employees: Employee[];
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

const PrintPreviewOvertime: React.FC<PrintPreviewOvertimeProps> = ({ records, employees, onClose, startDate, endDate }) => {

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Desconhecido';

  const handlePrint = () => {
    window.print();
  }

  const totals = React.useMemo(() => {
    return records.reduce((acc, record) => {
      const employee = employees.find(e => e.id === record.employeeId);
      if (employee) {
        const hours = calculateHoursWorked(record.startTime, record.endTime);
        const value = calculateOvertimeValue(employee.baseSalary, hours, record.serviceType);
        acc.totalHours += hours;
        acc.totalValue += value;
      }
      return acc;
    }, { totalHours: 0, totalValue: 0 });
  }, [records, employees]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8 z-50 overflow-y-auto animate-fade-in print-preview-overlay">
      <style>{`
        @media print {
          @page {
            size: a4 landscape;
            margin: 0;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .no-print, 
          header, 
          nav, 
          main > div:not(.print-preview-overlay),
          .print-preview-overlay > div:not(.print-content-wrapper) {
            display: none !important;
          }

          .print-preview-overlay {
            position: static !important;
            display: block !important;
            background: white !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .print-content-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-page {
            width: 297mm !important;
            min-height: 210mm !important;
            padding: 15mm !important;
            margin: 0 auto !important;
            page-break-after: always !important;
            background: white !important;
            box-sizing: border-box !important;
            display: block !important;
          }

           .print-page:last-child {
            page-break-after: auto !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border-bottom: 1px solid #ddd !important;
            color: black !important;
          }

          th {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
          }

          * {
            color: black !important;
          }
        }
      `}</style>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-7xl shadow-2xl overflow-hidden print-content-wrapper">
        <div className="p-5 flex justify-between items-center border-b border-slate-700 bg-slate-900 no-print">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Visualização de Impressão de Relatório
            </h2>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-sky-900/20">Imprimir</button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-gray-100 no-print overflow-y-auto max-h-[75vh]">
            <p className="text-center text-slate-500 text-xs mb-4 uppercase tracking-widest font-bold">Pré-visualização do Relatório</p>
            <div className="print-page bg-white shadow-2xl mx-auto">
              <header className="flex justify-between items-end mb-6 pb-4 border-b border-black">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight text-black">Central Truck</h1>
                  <h2 className="text-lg font-semibold text-gray-800">Relatório de Horas Extras</h2>
                </div>
                <div className="text-right text-xs text-gray-700">
                  <p><strong className="text-black">Período:</strong> {startDate ? formatDate(startDate) : 'Início'} a {endDate ? formatDate(endDate) : 'Fim'}</p>
                  <p><strong className="text-black">Emitido em:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </header>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100">
                    <th className="p-2 font-bold text-black uppercase tracking-wider">Funcionário</th>
                    <th className="p-2 font-bold text-black uppercase tracking-wider">Data</th>
                    <th className="p-2 font-bold text-black uppercase tracking-wider">Início</th>
                    <th className="p-2 font-bold text-black uppercase tracking-wider">Fim</th>
                    <th className="p-2 text-right font-bold text-black uppercase tracking-wider">Horas</th>
                    <th className="p-2 font-bold text-black uppercase tracking-wider text-center">Tipo</th>
                    <th className="p-2 font-bold text-black uppercase tracking-wider">Observação</th>
                    <th className="p-2 text-right font-bold text-black uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    const hours = calculateHoursWorked(record.startTime, record.endTime);
                    const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);
                    return (
                      <tr key={record.id}>
                        <td className="p-2 font-semibold text-black">{getEmployeeName(record.employeeId)}</td>
                        <td className="p-2 text-gray-700">{formatDate(record.date)}</td>
                        <td className="p-2 font-mono text-gray-700">{record.startTime}</td>
                        <td className="p-2 font-mono text-gray-700">{record.endTime}</td>
                        <td className="p-2 text-right font-mono font-bold text-black">{hours.toFixed(2)}</td>
                        <td className="p-2 text-center text-gray-700">{record.serviceType}</td>
                        <td className="p-2 max-w-[150px] truncate text-gray-600 italic">{record.observation || '-'}</td>
                        <td className="p-2 text-right font-mono font-bold text-black">{formatCurrency(value)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black bg-gray-50 font-bold">
                    <td colSpan={4} className="p-3 text-right text-black uppercase">Totais Gerais do Período:</td>
                    <td className="p-3 text-right font-mono text-lg text-black">{totals.totalHours.toFixed(2)}h</td>
                    <td colSpan={2}></td>
                    <td className="p-3 text-right font-mono text-lg text-black">{formatCurrency(totals.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 italic">
                <p>Relatório gerado automaticamente pelo sistema de gestão Central Truck.</p>
                <p>Página 1 de 1</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewOvertime;