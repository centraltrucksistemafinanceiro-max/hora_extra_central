import React from 'react';
import { createPortal } from 'react-dom';
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

  const content = (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 sm:p-8 z-[9999] overflow-y-auto" id="print-modal-overtime-container">
      <style>{`
        @media screen {
          #print-only-report-content {
            display: none;
          }
        }

        @media print {
          body > * {
            display: none !important;
          }

          body > #print-portal-overtime {
            display: block !important;
          }

          #print-modal-overtime-container {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
          }

          .no-print {
            display: none !important;
          }

          #print-only-report-content {
            display: block !important;
            width: 100% !important;
          }

          @page {
            size: a4 landscape;
            margin: 0;
          }

          .print-page {
            width: 297mm !important;
            min-height: 210mm !important;
            padding: 15mm !important;
            page-break-after: always !important;
            background: white !important;
            box-sizing: border-box !important;
          }

           .print-page:last-child {
            page-break-after: auto !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid black !important;
            padding: 8px !important;
          }

          * {
            color: black !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden no-print">
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/20 p-2 rounded-lg text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white uppercase">Relatório de Horas Extras</h2>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-sky-500/20 transition-all">Imprimir</button>
                <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl border border-slate-700">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-slate-950/50">
            <div className="bg-white shadow-2xl mx-auto p-[15mm]" style={{ minWidth: '280mm' }}>
                <header className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black text-black">
                  <div>
                    <h1 className="text-2xl font-black uppercase">CENTRAL TRUCK</h1>
                    <h2 className="text-lg font-bold">RELATÓRIO DE HORAS EXTRAS</h2>
                  </div>
                  <div className="text-right text-[10px] font-bold">
                    <p>PERÍODO: {startDate ? formatDate(startDate) : '---'} A {endDate ? formatDate(endDate) : '---'}</p>
                    <p>EMITIDO EM: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </header>
                <table className="w-full text-left text-[11px] border-collapse text-black">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-100">
                      <th className="p-2 font-black uppercase">Funcionário</th>
                      <th className="p-2 font-black uppercase">Data</th>
                      <th className="p-2 font-black uppercase">Horas</th>
                      <th className="p-2 font-black uppercase">Tipo</th>
                      <th className="p-2 text-right font-black uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => {
                      const employee = employees.find(e => e.id === record.employeeId);
                      const hours = calculateHoursWorked(record.startTime, record.endTime);
                      const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);
                      return (
                        <tr key={record.id} className="border-b border-gray-200">
                          <td className="p-2 font-bold">{getEmployeeName(record.employeeId)}</td>
                          <td className="p-2">{formatDate(record.date)}</td>
                          <td className="p-2 font-mono">{hours.toFixed(2)}h</td>
                          <td className="p-2">{record.serviceType}</td>
                          <td className="p-2 text-right font-mono font-bold">{formatCurrency(value)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black bg-gray-50 font-black">
                      <td colSpan={2} className="p-3 text-right uppercase">Totais:</td>
                      <td className="p-3 font-mono">{totals.totalHours.toFixed(2)}h</td>
                      <td></td>
                      <td className="p-3 text-right font-mono">{formatCurrency(totals.totalValue)}</td>
                    </tr>
                  </tfoot>
                </table>
            </div>
        </div>
      </div>

      <div id="print-only-report-content">
           <div className="print-page">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: '900' }}>CENTRAL TRUCK</h1>
                    <h2 style={{ margin: 0 }}>RELATÓRIO DE HORAS EXTRAS</h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid black', backgroundColor: '#eee' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>FUNCIONÁRIO</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>DATA</th>
                            <th style={{ textAlign: 'center', padding: '8px' }}>HORAS</th>
                            <th style={{ textAlign: 'center', padding: '8px' }}>TIPO</th>
                            <th style={{ textAlign: 'right', padding: '8px' }}>VALOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => {
                            const employee = employees.find(e => e.id === record.employeeId);
                            const hours = calculateHoursWorked(record.startTime, record.endTime);
                            const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);
                            return (
                                <tr key={record.id} style={{ borderBottom: '1px solid black' }}>
                                    <td style={{ padding: '8px' }}>{getEmployeeName(record.employeeId)}</td>
                                    <td style={{ padding: '8px' }}>{formatDate(record.date)}</td>
                                    <td style={{ textAlign: 'center', padding: '8px' }}>{hours.toFixed(2)}h</td>
                                    <td style={{ textAlign: 'center', padding: '8px' }}>{record.serviceType}</td>
                                    <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(value)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot style={{ fontWeight: 'bold' }}>
                        <tr style={{ backgroundColor: '#eee' }}>
                            <td colSpan={2} style={{ textAlign: 'right', padding: '10px' }}>TOTAIS:</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>{totals.totalHours.toFixed(2)}h</td>
                            <td></td>
                            <td style={{ textAlign: 'right', padding: '10px' }}>{formatCurrency(totals.totalValue)}</td>
                        </tr>
                    </tfoot>
                </table>
           </div>
      </div>
    </div>
  );

  let portalRoot = document.getElementById('print-portal-overtime');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'print-portal-overtime';
    document.body.appendChild(portalRoot);
  }

  return createPortal(content, portalRoot);
};

export default PrintPreviewOvertime;