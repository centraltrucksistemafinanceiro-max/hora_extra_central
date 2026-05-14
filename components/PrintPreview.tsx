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

  // Chunk summaries into groups of 3 for each page
  const RECIPTS_PER_PAGE = 3;
  const pages = Array.from({ length: Math.ceil(summaries.length / RECIPTS_PER_PAGE) }, (_, i) =>
    summaries.slice(i * RECIPTS_PER_PAGE, i * RECIPTS_PER_PAGE + RECIPTS_PER_PAGE)
  );

  const content = (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 sm:p-8 z-[9999] overflow-y-auto" id="print-modal-container">
      <style>{`
        @media screen {
          #print-only-content {
            display: none;
          }
        }

        @media print {
          body > * {
            display: none !important;
          }

          body > #print-portal-receipts {
            display: block !important;
          }

          #print-modal-container {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
          }

          .no-print {
            display: none !important;
          }

          #print-only-content {
            display: block !important;
            width: 100% !important;
          }

          @page {
            size: a4;
            margin: 0;
          }

          .receipt-page {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 10mm 15mm !important;
            page-break-after: always !important;
            background: white !important;
            box-sizing: border-box !important;
          }

          .receipt-page:last-child {
            page-break-after: auto !important;
          }

          .receipt-item {
            border: 2pt solid black !important;
            margin-bottom: 8mm !important;
            padding: 20px !important;
            page-break-inside: avoid !important;
            min-height: 85mm !important;
            display: flex !important;
            flex-direction: column !important;
          }

          * {
            color: black !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* UI Overlay */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden no-print mb-10">
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/20 p-2 rounded-lg text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white uppercase">Recibos (3 por página)</h2>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-sky-500/20 transition-all">Imprimir</button>
                <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl border border-slate-700">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-slate-950/50">
            {pages.map((pageSummaries, pageIndex) => (
                <div key={pageIndex} className="bg-white shadow-2xl mx-auto mb-10 p-[15mm]" style={{ width: '210mm', minHeight: '297mm' }}>
                    {pageSummaries.map((summary) => (
                       <div key={summary.employeeId} className="border-2 border-black p-6 flex flex-col text-[12px] mb-8 min-h-[8.5cm] text-black">
                            <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tighter">CENTRAL TRUCK</h1>
                                    <p className="text-[10px] font-bold text-gray-500">RECIBO DE PAGAMENTO DE HORAS EXTRAS</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black">{formatCurrency(summary.totalValue)}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="mb-2"><strong>RECEBEMOS DE:</strong> CENTRAL TRUCK LTDA</p>
                                <p className="mb-2"><strong>A IMPORTÂNCIA DE:</strong> <span className="italic font-bold">VALOR DECLARADO ABAIXO</span></p>
                                <p className="mb-2"><strong>FAVORECIDO:</strong> <span className="text-base font-black uppercase">{summary.employeeName}</span></p>
                            </div>

                            <table className="w-full border-collapse mb-6">
                                <thead>
                                    <tr className="border-b-2 border-black bg-gray-50">
                                        <th className="text-left py-2 px-1">DESCRIÇÃO</th>
                                        <th className="text-right py-2 px-1">HORAS</th>
                                        <th className="text-right py-2 px-1">VALOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-300">
                                        <td className="py-3 px-1 font-bold">PRESTAÇÃO DE SERVIÇOS EXTRAORDINÁRIOS</td>
                                        <td className="text-right py-3 px-1 font-mono text-base">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                        <td className="text-right py-3 px-1 font-mono text-base">{formatCurrency(summary.totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-auto">
                                <div className="border-2 border-black p-3 flex justify-between font-black mb-10 bg-gray-50">
                                    <span className="text-sm">TOTAL LÍQUIDO A RECEBER:</span>
                                    <span className="text-xl">{formatCurrency(summary.totalValue)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase mb-1">LOCAL E DATA:</p>
                                        <span className="text-xs font-bold border-b border-black pb-1">CENTRAL TRUCK, {getCurrentDateFormatted()}</span>
                                    </div>
                                    <div className="border-t-2 border-black w-64 text-center pt-2">
                                        <p className="text-[11px] font-black uppercase">{summary.employeeName}</p>
                                        <p className="text-[9px] text-gray-500 font-bold italic">ASSINATURA DO BENEFICIÁRIO</p>
                                    </div>
                                </div>
                            </div>
                       </div>
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* Impressão Real */}
      <div id="print-only-content">
           {pages.map((pageSummaries, pageIndex) => (
                <div key={pageIndex} className="receipt-page">
                    {pageSummaries.map((summary) => (
                        <div key={summary.employeeId} className="receipt-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3pt solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: '900' }}>CENTRAL TRUCK</h1>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '10pt' }}>RECIBO DE PAGAMENTO - HORAS EXTRAS</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '16pt', fontWeight: '900' }}>{formatCurrency(summary.totalValue)}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px', fontSize: '11pt' }}>
                                <p style={{ margin: '5px 0' }}><strong>FAVORECIDO:</strong> <span style={{ fontSize: '14pt', fontWeight: '900' }}>{summary.employeeName.toUpperCase()}</span></p>
                                <p style={{ margin: '5px 0' }}><strong>REFERENTE A:</strong> SERVIÇOS DE HORAS EXTRAS CONFORME CONTROLE INTERNO</p>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2pt solid black', backgroundColor: '#f0f0f0' }}>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>DESCRIÇÃO</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>QTD HORAS</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>VALOR TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '15px 10px', fontStyle: 'italic' }}>Horas Extras Realizadas no Período</td>
                                        <td style={{ textAlign: 'right', padding: '15px 10px', fontWeight: 'bold', fontSize: '12pt' }}>{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                        <td style={{ textAlign: 'right', padding: '15px 10px', fontWeight: 'bold', fontSize: '12pt' }}>{formatCurrency(summary.totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ border: '2.5pt solid black', padding: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', margin: '20px 0', backgroundColor: '#f9f9f9' }}>
                                    <span style={{ fontSize: '12pt' }}>TOTAL LÍQUIDO A RECEBER:</span>
                                    <span style={{ fontSize: '18pt' }}>{formatCurrency(summary.totalValue)}</span>
                                </div>
                                
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: '10pt' }}>
                                        <strong>LOCAL E DATA:</strong><br/>
                                        CENTRAL TRUCK, {getCurrentDateFormatted()}
                                    </div>
                                    <div style={{ borderTop: '2pt solid black', width: '320px', textAlign: 'center', paddingTop: '8px' }}>
                                        <p style={{ margin: 0, fontSize: '11pt', fontWeight: '900' }}>{summary.employeeName.toUpperCase()}</p>
                                        <p style={{ margin: 0, fontSize: '8pt', fontWeight: 'bold' }}>ASSINATURA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
           ))}
      </div>
    </div>
  );

  let portalRoot = document.getElementById('print-portal-receipts');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'print-portal-receipts';
    document.body.appendChild(portalRoot);
  }

  return createPortal(content, portalRoot);
};

export default PrintPreview;