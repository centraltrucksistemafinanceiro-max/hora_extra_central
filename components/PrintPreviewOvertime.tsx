import React from 'react';
import type { OvertimeRecord, Employee } from '../types';
import { calculateHoursWorked, calculateOvertimeValue } from '../utils/calculations';

interface PrintPreviewOvertimeProps {
  records: OvertimeRecord[];
  employees: Employee[];
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

const PrintPreviewOvertime: React.FC<PrintPreviewOvertimeProps> = ({ records, employees, onClose, startDate, endDate }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', 'currency': 'BRL' }).format(value);
  }
  
  const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
  }
  
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8 z-50 overflow-y-auto animate-fade-in">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .no-print {
            display: none;
          }
          @page {
            size: a4 landscape;
            margin: 1.5cm;
          }
          .print-page {
            width: 100%;
            height: 100%;
            page-break-after: always;
          }
           .print-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-7xl shadow-2xl overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-slate-700 bg-slate-900 no-print">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Visualização de Impressão
            </h2>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-sky-900/20">Imprimir</button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
            </div>
        </div>
        <div className="p-4 sm:p-8 bg-white print-area text-black font-sans">
            <div className="print-page">
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
                  <tr className="border-b-2 border-black">
                    <th className="p-2 font-bold text-black">Funcionário</th>
                    <th className="p-2 font-bold text-black">Data</th>
                    <th className="p-2 font-bold text-black">Início</th>
                    <th className="p-2 font-bold text-black">Fim</th>
                    <th className="p-2 text-right font-bold text-black">Horas</th>
                    <th className="p-2 font-bold text-black">Tipo</th>
                    <th className="p-2 font-bold text-black">Observação</th>
                    <th className="p-2 text-right font-bold text-black">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    const hours = calculateHoursWorked(record.startTime, record.endTime);
                    const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);
                    return (
                      <tr key={record.id} className="border-b border-gray-300">
                        <td className="p-2 font-medium text-black">{getEmployeeName(record.employeeId)}</td>
                        <td className="p-2 text-gray-800">{formatDate(record.date)}</td>
                        <td className="p-2 font-mono text-gray-800">{record.startTime}</td>
                        <td className="p-2 font-mono text-gray-800">{record.endTime}</td>
                        <td className="p-2 text-right font-mono text-gray-800">{hours.toFixed(2)}</td>
                        <td className="p-2 text-gray-800">{record.serviceType}</td>
                        <td className="p-2 max-w-[200px] truncate text-gray-800">{record.observation || '-'}</td>
                        <td className="p-2 text-right font-mono text-black">{formatCurrency(value)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black bg-gray-100 font-bold">
                    <td colSpan={4} className="p-2 text-right text-black">TOTAIS:</td>
                    <td className="p-2 text-right font-mono text-black">{totals.totalHours.toFixed(2)}</td>
                    <td colSpan={2}></td>
                    <td className="p-2 text-right font-mono text-black">{formatCurrency(totals.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewOvertime;