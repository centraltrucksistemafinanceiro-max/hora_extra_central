import React from 'react';
import { createPortal } from 'react-dom';
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

  const content = (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 sm:p-8 z-[9999] overflow-y-auto" id="print-modal-root">
      <style>{`
        @media screen {
          #print-area-portal {
            display: none;
          }
        }

        @media print {
          /* Esconde absolutamente tudo no body */
          body > * {
            display: none !important;
          }

          /* Mostra apenas o nosso portal de impressão */
          body > #print-area-portal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          @page {
            size: a4;
            margin: 10mm;
          }

          .receipt-page {
            width: 100% !important;
            page-break-after: always !important;
            background: white !important;
            padding: 5mm !important;
            box-sizing: border-box !important;
          }

          .receipt-page:last-child {
            page-break-after: auto !important;
          }

          .receipt-item {
            border: 1.5pt solid black !important;
            margin-bottom: 8mm !important;
            padding: 15px !important;
            page-break-inside: avoid !important;
            display: block !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          * {
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* UI Overlay (Hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden no-print mb-10">
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Visualização de Recibos</h2>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95">Imprimir Agora</button>
                <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all border border-slate-700">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-slate-950/50 backdrop-blur-sm">
            <p className="text-center text-slate-500 text-xs mb-6 uppercase tracking-[0.2em] font-bold">Documento Pronto para Impressão</p>
            <div className="flex flex-col gap-10">
                {pages.map((pageSummaries, pageIndex) => (
                    <div key={pageIndex} className="bg-white shadow-2xl mx-auto rounded-sm overflow-hidden" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                        {pageSummaries.map((summary) => (
                           <div key={summary.employeeId} className="border-2 border-black p-6 flex flex-col text-[11px] leading-snug mb-8 min-h-[5.5cm] relative">
                                <div className="flex justify-between items-start pb-3 border-b-2 border-black mb-4">
                                    <div>
                                        <h1 className="text-2xl font-black text-black uppercase tracking-tighter">CENTRAL TRUCK</h1>
                                        <p className="text-[9px] font-bold text-gray-600">SISTEMA DE GESTÃO DE TRANSPORTES</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-sm font-black text-black uppercase bg-gray-100 px-2 py-1">Recibo de Pagamento</h2>
                                        <p className="text-[10px] text-black font-bold mt-1">REF: HORAS EXTRAS</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-[9px] font-black text-black uppercase bg-gray-100 px-1">Beneficiário:</span>
                                    <p className="font-black text-black text-base uppercase mt-1">{summary.employeeName}</p>
                                </div>

                                <div className="flex-grow">
                                    <table className="w-full text-left text-[10px] border-collapse mb-4">
                                        <thead>
                                            <tr className="border-b-2 border-black bg-gray-50">
                                                <th className="py-2 px-1 font-black text-black uppercase">Descrição dos Serviços</th>
                                                <th className="py-2 px-1 font-black text-black uppercase text-right">Qtd. Horas</th>
                                                <th className="py-2 px-1 font-black text-black uppercase text-right">Valor Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-300">
                                                <td className="py-3 px-1 font-bold text-black italic">Prestação de serviços extraordinários (Horas Extras) conforme controle interno.</td>
                                                <td className="py-3 px-1 text-right font-mono font-black text-black text-sm">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                                <td className="py-3 px-1 text-right font-mono font-black text-black text-sm">{formatCurrency(summary.totalValue)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="mt-auto">
                                    <div className="border-2 border-black p-3 mb-8 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-black text-xs uppercase tracking-widest">TOTAL LÍQUIDO A RECEBER:</span>
                                            <span className="font-black text-xl text-black">{formatCurrency(summary.totalValue)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-end">
                                        <div className="text-[9px] text-black font-bold border-l-4 border-black pl-2">
                                           DATA DE EMISSÃO:<br/>
                                           <span className="text-xs">{getCurrentDateFormatted()}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="border-t-2 border-black w-64 pt-2 text-center">
                                                <p className="text-[10px] font-black text-black uppercase">{summary.employeeName}</p>
                                                <p className="text-[8px] text-gray-500 uppercase font-bold">Assinatura do Recebedor</p>
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
      </div>

      {/* Actual Print Container (Hidden on screen, but only thing visible on print) */}
      <div id="print-area-portal" className="hidden">
           {pages.map((pageSummaries, pageIndex) => (
                <div key={pageIndex} className="receipt-page">
                    {pageSummaries.map((summary) => (
                        <div key={summary.employeeId} className="receipt-item">
                            {/* Mesma estrutura simplificada para papel */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '15px' }}>
                                <div>
                                    <h1 style={{ fontSize: '20pt', fontWeight: '900', margin: 0 }}>CENTRAL TRUCK</h1>
                                    <p style={{ fontSize: '8pt', fontWeight: 'bold', margin: 0 }}>RECIBO DE PAGAMENTO - HORAS EXTRAS</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: 0 }}>{getCurrentDateFormatted()}</p>
                                </div>
                            </div>
                            
                            <p style={{ margin: '15px 0' }}><strong>FUNCIONÁRIO:</strong> <span style={{ fontSize: '12pt' }}>{summary.employeeName.toUpperCase()}</span></p>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid black' }}>
                                        <th style={{ textAlign: 'left', padding: '5px' }}>DESCRIÇÃO</th>
                                        <th style={{ textAlign: 'right', padding: '5px' }}>HORAS</th>
                                        <th style={{ textAlign: 'right', padding: '5px' }}>VALOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '10px 5px' }}>Horas Extras Realizadas</td>
                                        <td style={{ textAlign: 'right', padding: '10px 5px' }}>{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                        <td style={{ textAlign: 'right', padding: '10px 5px' }}>{formatCurrency(summary.totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ border: '2px solid black', padding: '10px', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                <strong>TOTAL A RECEBER:</strong>
                                <strong style={{ fontSize: '14pt' }}>{formatCurrency(summary.totalValue)}</strong>
                            </div>

                            <div style={{ marginTop: '50px', textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid black', width: '300px', margin: '0 auto', paddingTop: '5px' }}>
                                    <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: 0 }}>{summary.employeeName.toUpperCase()}</p>
                                    <p style={{ fontSize: '8pt', margin: 0 }}>Assinatura</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
           ))}
      </div>
    </div>
  );

  // Mount the entire thing in a portal at the end of body to avoid parent CSS issues
  let portalRoot = document.getElementById('print-area-portal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'print-area-portal-root';
    document.body.appendChild(portalRoot);
  }

  return createPortal(content, portalRoot);
};

export default PrintPreview;