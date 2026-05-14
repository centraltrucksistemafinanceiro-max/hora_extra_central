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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 sm:p-8 z-[9999] overflow-y-auto animate-fade-in" id="print-overtime-root">
      <style>{`
        @media screen {
          #print-area-portal-overtime {
            display: none;
          }
        }

        @media print {
          body > * {
            display: none !important;
          }

          body > #print-area-portal-overtime-root {
            display: block !important;
          }

          #print-area-portal-overtime {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          @page {
            size: a4 landscape;
            margin: 10mm;
          }

          .print-page {
            width: 100% !important;
            page-break-after: always !important;
            background: white !important;
            padding: 5mm !important;
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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* UI Overlay */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden no-print">
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Relatório de Horas Extras</h2>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95">Imprimir Relatório</button>
                <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all border border-slate-700">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-slate-950/50 backdrop-blur-sm no-print">
            <div className="print-page bg-white shadow-2xl mx-auto rounded-sm overflow-hidden" style={{ minWidth: '280mm', padding: '15mm' }}>
                <header className="flex justify-between items-end mb-8 pb-4 border-b-2 border-black">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-black">CENTRAL TRUCK</h1>
                  <h2 className="text-xl font-bold text-gray-700">RELATÓRIO DE HORAS EXTRAS</h2>
                </div>
                <div className="text-right text-[10px] text-gray-600 font-bold uppercase">
                  <p>Período: {startDate ? formatDate(startDate) : 'Início'} a {endDate ? formatDate(endDate) : 'Fim'}</p>
                  <p>Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </header>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <th className="p-3 font-black text-black uppercase">Funcionário</th>
                    <th className="p-3 font-black text-black uppercase">Data</th>
                    <th className="p-3 font-black text-black uppercase">Início</th>
                    <th className="p-3 font-black text-black uppercase">Fim</th>
                    <th className="p-3 text-right font-black text-black uppercase">Horas</th>
                    <th className="p-3 font-black text-black uppercase text-center">Tipo</th>
                    <th className="p-3 font-black text-black uppercase text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    const hours = calculateHoursWorked(record.startTime, record.endTime);
                    const value = calculateOvertimeValue(employee?.baseSalary || 0, hours, record.serviceType);
                    return (
                      <tr key={record.id}>
                        <td className="p-3 font-bold text-black">{getEmployeeName(record.employeeId)}</td>
                        <td className="p-3 text-gray-700">{formatDate(record.date)}</td>
                        <td className="p-3 font-mono text-gray-700">{record.startTime}</td>
                        <td className="p-3 font-mono text-gray-700">{record.endTime}</td>
                        <td className="p-3 text-right font-mono font-black text-black">{hours.toFixed(2)}</td>
                        <td className="p-3 text-center text-gray-700 font-bold">{record.serviceType}</td>
                        <td className="p-3 text-right font-mono font-black text-black">{formatCurrency(value)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black bg-gray-100 font-black">
                    <td colSpan={4} className="p-4 text-right text-black uppercase text-xs">Totais Gerais do Período:</td>
                    <td className="p-4 text-right font-mono text-xl text-black">{totals.totalHours.toFixed(2)}h</td>
                    <td colSpan={1}></td>
                    <td className="p-4 text-right font-mono text-xl text-black">{formatCurrency(totals.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
        </div>
      </div>

      {/* Actual Print Portal Container */}
      <div id="print-area-portal-overtime" className="hidden">
           <div className="print-page">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '24pt', fontWeight: '900', margin: 0 }}>CENTRAL TRUCK</h1>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0 }}>RELATÓRIO DE HORAS EXTRAS</h2>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '9pt' }}>
                        <p>PERÍODO: {startDate ? formatDate(startDate) : '---'} A {endDate ? formatDate(endDate) : '---'}</p>
                        <p>EMISSÃO: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid black', backgroundColor: '#f0f0f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>FUNCIONÁRIO</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>DATA</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>INÍCIO</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>FIM</th>
                            <th style={{ textAlign: 'right', padding: '8px' }}>HORAS</th>
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
                                <tr key={record.id} style={{ borderBottom: '1px solid #ccc' }}>
                                    <td style={{ padding: '8px' }}>{getEmployeeName(record.employeeId)}</td>
                                    <td style={{ padding: '8px' }}>{formatDate(record.date)}</td>
                                    <td style={{ padding: '8px' }}>{record.startTime}</td>
                                    <td style={{ padding: '8px' }}>{record.endTime}</td>
                                    <td style={{ textAlign: 'right', padding: '8px' }}>{hours.toFixed(2)}</td>
                                    <td style={{ textAlign: 'center', padding: '8px' }}>{record.serviceType}</td>
                                    <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(value)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid black', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                            <td colSpan={4} style={{ textAlign: 'right', padding: '10px' }}>TOTAIS:</td>
                            <td style={{ textAlign: 'right', padding: '10px' }}>{totals.totalHours.toFixed(2)}h</td>
                            <td></td>
                            <td style={{ textAlign: 'right', padding: '10px' }}>{formatCurrency(totals.totalValue)}</td>
                        </tr>
                    </tfoot>
                </table>
           </div>
      </div>
    </div>
  );

  let portalRoot = document.getElementById('print-area-portal-overtime-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'print-area-portal-overtime-root';
    document.body.appendChild(portalRoot);
  }

  return createPortal(content, portalRoot);
};

export default PrintPreviewOvertime;