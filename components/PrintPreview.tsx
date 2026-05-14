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
            margin: 5mm;
          }

          .receipt-page {
            width: 210mm !important;
            min-height: 280mm !important;
            padding: 5mm 15mm !important;
            page-break-after: always !important;
            background: white !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 5mm !important;
          }

          .receipt-page:last-child {
            page-break-after: auto !important;
          }

          .receipt-item {
            border: 2pt solid black !important;
            padding: 15px !important;
            page-break-inside: avoid !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            max-height: 85mm !important;
            overflow: hidden !important;
          }

          * {
            color: black !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* UI do Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden no-print mb-10">
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/20 p-2 rounded-lg text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white uppercase">Recibos (3 por página)</h2>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all">Imprimir</button>
                <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl">Fechar</button>
            </div>
        </div>
        
        <div className="p-8 bg-slate-950/50">
            {pages.map((pageSummaries, pageIndex) => (
                <div key={pageIndex} className="bg-white shadow-2xl mx-auto mb-10 p-[10mm] flex flex-col gap-4" style={{ width: '210mm', minHeight: '297mm' }}>
                    {pageSummaries.map((summary) => (
                       <div key={summary.employeeId} className="border-2 border-black p-5 flex flex-col text-[11px] min-h-[8cm] text-black">
                            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
                                <h1 className="text-xl font-black">CENTRAL TRUCK</h1>
                                <p className="font-bold">RECIBO DE PAGAMENTO</p>
                            </div>
                            <p className="mb-2"><strong>Beneficiário:</strong> {summary.employeeName.toUpperCase()}</p>
                            <table className="w-full border-collapse mb-4">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="text-left py-1">Descrição</th>
                                        <th className="text-right py-1">Horas</th>
                                        <th className="text-right py-1">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 italic">Serviços de Horas Extras no Período</td>
                                        <td className="text-right py-2 font-mono font-bold">{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                        <td className="text-right py-2 font-mono font-bold">{formatCurrency(summary.totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-auto">
                                <div className="border-2 border-black p-2 flex justify-between font-black mb-4 bg-gray-50">
                                    <span>VALOR LÍQUIDO:</span>
                                    <span>{formatCurrency(summary.totalValue)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px]">{getCurrentDateFormatted()}</span>
                                    <div className="border-t border-black w-48 text-center pt-1">
                                        <p className="text-[10px] font-bold uppercase">{summary.employeeName}</p>
                                        <p className="text-[8px]">Assinatura</p>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2pt solid black', paddingBottom: '8px', marginBottom: '12px' }}>
                                <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: '900' }}>CENTRAL TRUCK</h1>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>RECIBO DE PAGAMENTO</p>
                            </div>
                            <p style={{ margin: '8px 0', fontSize: '10pt' }}><strong>FUNCIONÁRIO:</strong> {summary.employeeName.toUpperCase()}</p>
                            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: '10pt' }}>
                                <tr style={{ borderBottom: '1.5pt solid black' }}>
                                    <th style={{ textAlign: 'left', padding: '5px' }}>DESCRIÇÃO</th>
                                    <th style={{ textAlign: 'right', padding: '5px' }}>HORAS</th>
                                    <th style={{ textAlign: 'right', padding: '5px' }}>VALOR</th>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 5px' }}>Serviços de Horas Extras</td>
                                    <td style={{ textAlign: 'right', padding: '8px 5px' }}>{summary.totalHours.toFixed(2).replace('.', ',')}h</td>
                                    <td style={{ textAlign: 'right', padding: '8px 5px' }}>{formatCurrency(summary.totalValue)}</td>
                                </tr>
                            </table>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ border: '2pt solid black', padding: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', margin: '12px 0' }}>
                                    <span>TOTAL A RECEBER:</span>
                                    <span>{formatCurrency(summary.totalValue)}</span>
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '9pt' }}>{getCurrentDateFormatted()}</span>
                                    <div style={{ borderTop: '1px solid black', width: '250px', textAlign: 'center', paddingTop: '5px' }}>
                                        <p style={{ margin: 0, fontSize: '10pt', fontWeight: 'bold' }}>{summary.employeeName.toUpperCase()}</p>
                                        <p style={{ margin: 0, fontSize: '8pt' }}>Assinatura</p>
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