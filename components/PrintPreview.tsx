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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8 z-50 overflow-y-auto print-preview-overlay">
      <style>{`
        @media print {
          /* Reset básico */
          @page {
            size: a4;
            margin: 0;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Esconde absolutamente tudo que tem a classe no-print */
          .no-print, 
          header, 
          nav, 
          main > div:not(.print-preview-overlay),
          .print-preview-overlay > div:not(.print-content-wrapper) {
            display: none !important;
          }

          /* Transforma o modal na própria página */
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

          .receipt-page {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 15mm !important;
            margin: 0 auto !important;
            page-break-after: always !important;
            background: white !important;
            box-sizing: border-box !important;
          }

          .receipt-page:last-child {
            page-break-after: auto !important;
          }

          .receipt-item {
            border: 1px solid black !important;
            margin-bottom: 10mm !important;
            padding: 15px !important;
            page-break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
          }

          /* Forçar cores pretas para impressão */
          * {
            color: black !important;
            border-color: black !important;
          }
        }
      `}</style>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden print-content-wrapper">
        <div className="p-5 flex justify-between items-center border-b border-slate-700 bg-slate-900 no-print">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Visualização de Impressão de Recibos
            </h2>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-sky-900/20">Imprimir</button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
            </div>
        </div>
        
        <div className="bg-gray-100 py-8 no-print">
            <p className="text-center text-slate-500 text-xs mb-4 uppercase tracking-widest font-bold">Pré-visualização do Documento</p>
            <div className="flex flex-col gap-8">
                {pages.map((pageSummaries, pageIndex) => (
                    <div key={pageIndex} className="receipt-page bg-white shadow-xl mx-auto flex flex-col gap-4">
                        {pageSummaries.map((summary) => (
                           <div key={summary.employeeId} className="receipt-item border border-black p-4 flex flex-col text-[10px] leading-tight min-h-[5.2cm]">
                                <div className="flex justify-between items-center pb-2 border-b border-black mb-2">
                                    <h1 className="text-lg font-bold text-black uppercase tracking-tight">Central Truck</h1>
                                    <div className="text-right">
                                        <h2 className="text-xs font-bold text-black uppercase">Recibo de Pagamento</h2>
                                        <p className="text-[9px] text-black italic">Ref. Horas Extras</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-[8px] text-black font-bold uppercase tracking-wider mb-0.5">Funcionário</p>
                                    <p className="font-bold text-black text-sm uppercase">{summary.employeeName}</p>
                                </div>

                                <table className="w-full text-left text-[9px] border-collapse mb-3">
                                    <thead>
                                        <tr className="border-b border-black">
                                            <th className="py-1.5 font-bold text-black uppercase tracking-wider">Descrição</th>
                                            <th className="py-1.5 font-bold text-black uppercase tracking-wider text-right">Horas</th>
                                            <th className="py-1.5 font-bold text-black uppercase tracking-wider text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-2 font-medium text-black italic">Total de horas extras realizadas no período.</td>
                                            <td className="py-2 text-right font-mono font-bold text-black">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                            <td className="py-2 text-right font-mono font-bold text-black">{formatCurrency(summary.totalValue)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div className="mt-auto">
                                    <div className="border border-black p-2.5 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-black text-[10px] uppercase tracking-wide">VALOR TOTAL LÍQUIDO:</span>
                                            <span className="font-bold text-base text-black">{formatCurrency(summary.totalValue)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-end">
                                        <div className="text-[8px] text-black font-medium">
                                           Emitido em: {getCurrentDateFormatted()}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="border-t border-black w-56 pt-1 text-center">
                                                <p className="text-[8px] font-bold text-black uppercase">{summary.employeeName}</p>
                                                <p className="text-[7px] text-black italic">Assinatura do Funcionário</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                           </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

        {/* Hidden copy for actual print process - ensures absolute clarity */}
        <div className="hidden">
             {/* This container could be used for specific portal logic if needed, 
                 but the style above already handles the direct layout transformation. */}
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;