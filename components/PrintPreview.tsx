import React from 'react';
import type { ReceiptSummary } from './Receipts';

interface PrintPreviewProps {
  summaries: ReceiptSummary[];
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ summaries, onClose }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  
  const getCurrentDateFormatted = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return `São Paulo, ${date.toLocaleDateString('pt-BR', options)}`;
  };

  const handlePrint = () => {
    window.print();
  }

  // Chunk summaries into groups of 4 for each page
  const pages = Array.from({ length: Math.ceil(summaries.length / 4) }, (_, i) =>
    summaries.slice(i * 4, i * 4 + 4)
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8 z-50 overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
            color: black !important;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
          }
          .no-print {
            display: none;
          }
          @page {
            size: a4 portrait;
            margin: 0;
          }
          .receipt-page {
            width: 100%;
            height: 29.6cm;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            padding: 0.5cm 1cm;
            box-sizing: border-box;
          }
          .receipt-page:last-child {
            page-break-after: auto;
          }
          .receipt-item {
            flex: 1;
            border-bottom: 1px dashed #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0.5cm 0;
          }
          .receipt-item:last-child {
            border-bottom: none;
          }
        }
      `}</style>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-slate-700 bg-slate-900 no-print">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Visualização de Impressão <span className="text-sm font-normal text-slate-400 ml-2">({summaries.length} recibos)</span>
            </h2>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-sky-900/20">Imprimir</button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
            </div>
        </div>
        <div className="p-4 sm:p-8 bg-white print-area text-black font-sans">
            {pages.map((pageSummaries, pageIndex) => (
                <div key={pageIndex} className="receipt-page">
                    {pageSummaries.map((summary) => (
                       <div key={summary.employeeId} className="receipt-item">
                            <div className="flex justify-between items-center pb-1 border-b border-black mb-1">
                                <h1 className="text-sm font-bold text-black uppercase tracking-tight">Central Truck</h1>
                                <div className="text-right">
                                    <h2 className="text-[10px] font-bold text-black uppercase">Recibo de Pagamento</h2>
                                    <p className="text-[7px] text-black italic">Ref. Horas Extras</p>
                                </div>
                            </div>

                            <div className="my-1">
                                <p className="text-[6px] text-black font-bold uppercase tracking-wider mb-0.5">Funcionário</p>
                                <p className="font-bold text-black text-[11px] uppercase">{summary.employeeName}</p>
                            </div>

                            <table className="w-full text-left text-[7px] border-collapse">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="py-0.5 font-bold text-black uppercase tracking-wider">Descrição</th>
                                        <th className="py-0.5 font-bold text-black uppercase tracking-wider text-right">Horas</th>
                                        <th className="py-0.5 font-bold text-black uppercase tracking-wider text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-0.5 font-medium text-black">Total de horas extras no período.</td>
                                        <td className="py-0.5 text-right font-mono font-bold text-black">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                        <td className="py-0.5 text-right font-mono font-bold text-black">{formatCurrency(summary.totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="mt-auto">
                                <div className="border border-black p-1 mt-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-black text-[8px] uppercase">VALOR TOTAL:</span>
                                        <span className="font-bold text-[11px] text-black">{formatCurrency(summary.totalValue)}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-2.5 flex flex-col items-center">
                                    <div className="border-t border-black w-36 pt-0.5 text-center">
                                        <p className="text-[6px] font-bold text-black uppercase">{summary.employeeName}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-1 pt-0.5 border-t border-black text-right">
                                   <p className="text-[6px] text-black font-medium">{getCurrentDateFormatted()}</p>
                                </div>
                            </div>
                       </div>
                    ))}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;