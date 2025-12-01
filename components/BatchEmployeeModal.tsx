import React, { useState, useMemo } from 'react';
import type { Employee } from '../types';

interface BatchEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (records: Omit<Employee, 'id' | 'isActive'>[]) => void;
  existingEmployees: Employee[];
}

type ParsedEmployeeRecord = {
    status: 'valid' | 'invalid';
    data: Partial<Omit<Employee, 'id' | 'isActive'>>;
    error?: string;
    originalLine: string;
};

const BatchEmployeeModal: React.FC<BatchEmployeeModalProps> = ({ isOpen, onClose, onImport, existingEmployees }) => {
    const [step, setStep] = useState<'paste' | 'preview'>('paste');
    const [pastedText, setPastedText] = useState('');
    const [parsedRecords, setParsedRecords] = useState<ParsedEmployeeRecord[]>([]);

    const handleClose = () => {
        setPastedText('');
        setParsedRecords([]);
        setStep('paste');
        onClose();
    };
    
    const parseCurrency = (value: string): number | null => {
        if (!value) return null;
        const cleaned = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const number = parseFloat(cleaned);
        return isNaN(number) ? null : number;
    }

    const processPastedText = () => {
        const lines = pastedText.trim().split('\n').filter(line => line.trim() !== '');
        const existingCodes = new Set(existingEmployees.map(e => e.code.toUpperCase()));
        const newCodesInBatch = new Set<string>();

        const records: ParsedEmployeeRecord[] = lines.map(line => {
            const columns = line.split('\t');
            if (columns.length < 3) { // Must have at least Code, Name, Salary
                return { status: 'invalid', data: {}, error: 'Número insuficiente de colunas. Esperado: 3.', originalLine: line };
            }

            const [code, name, baseSalaryStr] = columns.map(c => c.trim());
            const upperCode = code.toUpperCase();
            const upperName = name.toUpperCase();

            // 1. Validate Code
            if (!code) {
                return { status: 'invalid', data: {}, error: 'Código não pode estar em branco.', originalLine: line };
            }
            if (existingCodes.has(upperCode) || newCodesInBatch.has(upperCode)) {
                 return { status: 'invalid', data: {}, error: `Código '${code}' já existe.`, originalLine: line };
            }
            newCodesInBatch.add(upperCode);


            // 2. Validate Name
            if (!name) {
                return { status: 'invalid', data: {}, error: 'Nome não pode estar em branco.', originalLine: line };
            }
            
            // 3. Validate Salary
            const salary = parseCurrency(baseSalaryStr);
            if (salary === null || salary <= 0) {
                return { status: 'invalid', data: {}, error: `Salário inválido: '${baseSalaryStr}'. Deve ser um número positivo.`, originalLine: line };
            }

            return {
                status: 'valid',
                data: {
                    code: upperCode,
                    name: upperName,
                    baseSalary: salary,
                },
                originalLine: line,
            };
        });

        setParsedRecords(records);
        setStep('preview');
    };
    
    const validRecordsToImport = useMemo(() => {
        return parsedRecords
            .filter(r => r.status === 'valid')
            .map(r => r.data as Omit<Employee, 'id' | 'isActive'>);
    }, [parsedRecords]);

    const handleImport = () => {
        if (validRecordsToImport.length > 0) {
            onImport(validRecordsToImport);
            handleClose();
        }
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in" onClick={handleClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
                    Cadastro em Lote de Funcionários
                </h2>
            </div>
            
            {step === 'paste' && (
                <div className="p-6 space-y-4">
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 text-sm text-slate-300">
                        <p className="font-bold text-white mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Instruções de Importação:
                        </p>
                        <p className="mb-2 pl-7">1. Copie os dados de sua planilha (Excel, Google Sheets).</p>
                        <p className="mb-2 pl-7">2. Cole no campo abaixo. As colunas devem estar na seguinte ordem:</p>
                        <div className="font-mono bg-slate-950 px-4 py-3 rounded-lg mt-3 text-sky-400 text-xs border border-slate-800 ml-7 shadow-inner">
                            Código | Nome | Salário Base
                        </div>
                    </div>
                    <textarea 
                        value={pastedText}
                        onChange={e => setPastedText(e.target.value)}
                        placeholder="Cole os dados aqui..."
                        className="w-full h-64 bg-slate-950/50 border border-slate-700 rounded-xl p-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 font-mono text-sm transition-all resize-none shadow-inner"
                    />
                </div>
            )}

            {step === 'preview' && (
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm font-bold text-white uppercase tracking-wide">Resumo da Validação</p>
                        <div className="flex gap-4">
                            <span className="text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-emerald-400"><span className="font-bold text-lg mr-1">{validRecordsToImport.length}</span> válidos</span>
                            <span className="text-sm bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 text-red-400"><span className="font-bold text-lg mr-1">{parsedRecords.length - validRecordsToImport.length}</span> erros</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-700 shadow-inner">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="border-b border-slate-700 text-xs uppercase text-slate-400 sticky top-0 bg-slate-900 z-10">
                                <tr>
                                    {['Status', 'Código', 'Nome', 'Salário', 'Erro'].map(h => <th key={h} className="p-3 font-bold">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {parsedRecords.map((record, index) => (
                                    <tr key={index} className={`${record.status === 'valid' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'bg-red-500/5 hover:bg-red-500/10'}`}>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${record.status === 'valid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {record.status === 'valid' ? 'Válido' : 'Erro'}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono">{record.data.code || record.originalLine.split('\t')[0]}</td>
                                        <td className="p-3 font-medium text-white">{record.data.name || record.originalLine.split('\t')[1]}</td>
                                        <td className="p-3 font-mono">{record.data.baseSalary ? `R$ ${record.data.baseSalary.toFixed(2)}` : record.originalLine.split('\t')[2]}</td>
                                        <td className="p-3 text-red-400 font-medium">{record.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="p-5 bg-slate-950/50 flex justify-end gap-3 rounded-b-2xl mt-auto border-t border-slate-800">
                <button onClick={handleClose} className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Cancelar</button>
                {step === 'paste' ? (
                    <button onClick={processPastedText} disabled={!pastedText.trim()} className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5">Processar Dados</button>
                ) : (
                    <>
                        <button onClick={() => setStep('paste')} className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">Voltar</button>
                        <button onClick={handleImport} disabled={validRecordsToImport.length === 0} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5">Importar {validRecordsToImport.length} Registros</button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default BatchEmployeeModal;