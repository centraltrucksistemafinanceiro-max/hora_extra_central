import React from 'react';
import type { ReceiptSummary } from './Receipts';
import { formatCurrency, getCurrentDateFormatted } from '../utils/formatters';

interface PrintPreviewProps {
  summaries: ReceiptSummary[];
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ summaries, onClose }) => {

  const handlePrint = () => {
    window.print();
  }

  // Chunk summaries into groups of 5 for each page
  const pages = Array.from({ length: Math.ceil(summaries.length / 5) }, (_, i) =>
    summaries.slice(i * 5, i * 5 + 5)
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8 z-50 overflow-y-auto">
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Only show the print container and its children */
          #print-receipt-container, #print-receipt-container * {
            visibility: visible !important;
          }

          #print-receipt-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: a4;
            margin: 1cm;
          }

          .receipt-page {
            width: 100% !important;
            page-break-after: always !important;
            display: block !important;
            background: white !important;
          }

          .receipt-page:last-child {
            page-break-after: auto !important;
          }

          .receipt-item {
            border: 1px solid black !important;
            margin-bottom: 0.5cm !important;
            padding: 10px !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden no-print">
        <div className="p-5 flex justify-between items-center border-b border-slate-700 bg-slate-900">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Visualização de Impressão de Recibos
            </h2>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-sky-900/20">Imprimir</button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
            </div>
        </div>
        
        {/* Scrollable Preview for UI */}
        <div className="p-8 bg-gray-100 overflow-y-auto max-h-[70vh]">
            <div id="print-receipt-container" className="bg-white text-black font-sans mx-auto shadow-sm" style={{ width: '210mm' }}>
                {pages.map((pageSummaries, pageIndex) => (
                    <div key={pageIndex} className="receipt-page p-[1cm]">
                        {pageSummaries.map((summary) => (
                           <div key={summary.employeeId} className="receipt-item border border-black p-4 flex flex-col text-[10px] leading-tight mb-4 min-h-[5cm]">
                                <div className="flex justify-between items-center pb-2 border-b border-black mb-1">
                                    <h1 className="text-lg font-bold text-black uppercase tracking-tight">Central Truck</h1>
                                    <div className="text-right">
                                        <h2 className="text-xs font-bold text-black uppercase">Recibo de Pagamento</h2>
                                        <p className="text-[9px] text-black italic">Ref. Horas Extras</p>
                                    </div>
                                </div>

                                <div className="my-2">
                                    <p className="text-[8px] text-black font-bold uppercase tracking-wider mb-0.5">Funcionário</p>
                                    <p className="font-bold text-black text-sm uppercase">{summary.employeeName}</p>
                                </div>

                                <table className="w-full text-left text-[9px] border-collapse mb-2">
                                    <thead>
                                        <tr className="border-b border-black">
                                            <th className="py-1 font-bold text-black uppercase tracking-wider">Descrição</th>
                                            <th className="py-1 font-bold text-black uppercase tracking-wider text-right">Horas</th>
                                            <th className="py-1 font-bold text-black uppercase tracking-wider text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-1 font-medium text-black">Total de horas extras no período.</td>
                                            <td className="py-1 text-right font-mono font-bold text-black">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                            <td className="py-1 text-right font-mono font-bold text-black">{formatCurrency(summary.totalValue)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div className="mt-auto">
                                    <div className="border border-black p-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-black text-[10px] uppercase">VALOR TOTAL:</span>
                                            <span className="font-bold text-sm text-black">{formatCurrency(summary.totalValue)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-col items-center">
                                        <div className="border-t border-black w-48 pt-1 text-center">
                                            <p className="text-[8px] font-bold text-black uppercase">{summary.employeeName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 pt-1 border-t border-black text-right">
                                       <p className="text-[8px] text-black font-medium">{getCurrentDateFormatted()}</p>
                                    </div>
                                </div>
                           </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;