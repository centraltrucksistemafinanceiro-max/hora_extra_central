import React, { useMemo, useState, useEffect } from 'react';
import type { Employee, OvertimeRecord } from '../types';
import { calculateHoursWorked, calculateOvertimeValue } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


interface DashboardProps {
  employees: Employee[];
  overtimeRecords: OvertimeRecord[];
  isConfidential: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, overtimeRecords, isConfidential }) => {
  const getMonthDateRange = (date = new Date()) => {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      return { start: startOfMonth, end: endOfMonth };
  }

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [dateRange, setDateRange] = useState(getMonthDateRange());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100); // Small delay for transition
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const filteredRecords = useMemo(() => {
    return overtimeRecords.filter(record => {
      const isEmployeeMatch = selectedEmployeeId === 'all' || record.employeeId === selectedEmployeeId;
      
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0,0,0,0);

      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      if(startDate) startDate.setUTCHours(0,0,0,0);

      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      if(endDate) endDate.setUTCHours(0,0,0,0);

      const isAfterStartDate = !startDate || recordDate >= startDate;
      const isBeforeEndDate = !endDate || recordDate <= endDate;

      return isEmployeeMatch && isAfterStartDate && isBeforeEndDate;
    });
  }, [overtimeRecords, selectedEmployeeId, dateRange]);

  const { totalHours, totalPaid } = useMemo(() => {
    let totalHours = 0;
    let totalPaid = 0;
    filteredRecords.forEach(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      if (employee) {
        const hours = calculateHoursWorked(record.startTime, record.endTime);
        totalHours += hours;
        totalPaid += calculateOvertimeValue(employee.baseSalary, hours, record.serviceType);
      }
    });
    return { totalHours, totalPaid };
  }, [filteredRecords, employees]);
  
  const activeEmployeesCount = employees.filter(e => e.isActive).length;

  const dailyChartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    filteredRecords.forEach(record => {
        const hours = calculateHoursWorked(record.startTime, record.endTime);
        const dateKey = new Date(record.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        const currentHours = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentHours + hours);
    });
    
    return Array.from(dataMap.entries())
        .map(([date, hours]) => ({
            name: date,
            Horas: parseFloat(hours.toFixed(1))
        }))
        // Sort by date correctly
        .sort((a,b) => {
            const dateA = a.name.split('/').reverse().join('-');
            const dateB = b.name.split('/').reverse().join('-');
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
  }, [filteredRecords]);

  const isSingleEmployeeSelected = selectedEmployeeId !== 'all';

  const topEmployeesData = useMemo(() => {
    if (isSingleEmployeeSelected) return [];

    const employeeHours = new Map<string, number>();
    filteredRecords.forEach(record => {
      const hours = calculateHoursWorked(record.startTime, record.endTime);
      employeeHours.set(record.employeeId, (employeeHours.get(record.employeeId) || 0) + hours);
    });

    return Array.from(employeeHours.entries())
      .map(([employeeId, hours]) => ({
        name: employees.find(e => e.id === employeeId)?.name || 'Desconhecido',
        value: parseFloat(hours.toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .filter(d => d.value > 0);

  }, [filteredRecords, employees, isSingleEmployeeSelected]);

  const serviceTypeData = useMemo(() => {
    if (!isSingleEmployeeSelected) return [];

    const data = { '60%': 0, '100%': 0 };
    filteredRecords.forEach(record => {
        const hours = calculateHoursWorked(record.startTime, record.endTime);
        data[record.serviceType] += hours;
    });
    return [
        { name: 'Hora Extra 60%', value: parseFloat(data['60%'].toFixed(1)) },
        { name: 'Hora Extra 100%', value: parseFloat(data['100%'].toFixed(1)) },
    ].filter(d => d.value > 0);
  }, [filteredRecords, isSingleEmployeeSelected]);
  
  const PIE_COLORS = {
    'Top': ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    'Service': ['#0ea5e9', '#ef4444']
  };

  const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string, gradient: string }> = ({ title, value, icon, colorClass, gradient }) => (
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 group transition-all duration-300 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/10">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`}></div>
      <div className="relative flex items-center gap-5">
        <div className={`p-4 rounded-xl text-white shadow-lg shadow-black/20 ${gradient} relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {icon}
        </div>
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
  
  const ChartContainer: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/80 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
        {title}
      </h3>
      <div className="h-72">
        {children}
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 transition-opacity duration-700 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Global Filters */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center shadow-lg">
            <div className="flex items-center gap-3 text-slate-300 shrink-0 md:pr-4 md:border-r border-slate-800">
                <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">Filtros</h3>
            </div>
            <div className="w-full md:w-1/3">
                <label htmlFor="employee-filter" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Funcionário</label>
                <div className="relative">
                    <select id="employee-filter" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full appearance-none bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all cursor-pointer">
                        <option value="all">Todos os Funcionários</option>
                        {employees.filter(e => e.isActive).map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/3">
                <label htmlFor="start-date-filter" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Data Início</label>
                <input type="date" id="start-date-filter" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all [color-scheme:dark]" />
            </div>
            <div className="w-full md:w-1/3">
                <label htmlFor="end-date-filter" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Data Fim</label>
                <input type="date" id="end-date-filter" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all [color-scheme:dark]" />
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                title="Funcionários Ativos" 
                value={String(activeEmployeesCount)} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                colorClass="bg-emerald-500/80"
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard 
                title="Horas Extras no Período" 
                value={`${totalHours.toFixed(1).replace('.', ',')}h`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                colorClass="bg-sky-500/80"
                gradient="bg-gradient-to-br from-sky-500 to-blue-600"
            />
            <StatCard 
                title="Valor Total no Período" 
                value={isConfidential ? 'R$ ••••••' : formatCurrency(totalPaid)} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0a3 3 0 00-3 3v1a3 3 0 003 3h1a3 3 0 003-3v-1a3 3 0 00-3-3h-1m-4 4H5m14 0h-4" /></svg>}
                colorClass="bg-amber-500/80"
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
            <ChartContainer title="Horas Extras por Dia (Período Selecionado)">
                {dailyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            labelStyle={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{color: '#94a3b8'}} iconType="circle" />
                        <Bar dataKey="Horas" fill="#0ea5e9" name="Total de Horas" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">Não há dados no período selecionado.</div>}
            </ChartContainer>
            </div>
            <div className="lg:col-span-2">
                <ChartContainer title={isSingleEmployeeSelected ? `Horas por Tipo de Serviço` : `Top 5 Funcionários (Período)`}>
                {isSingleEmployeeSelected ? (
                    serviceTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={serviceTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} fill="#8884d8" dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {serviceTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS['Service'][index % PIE_COLORS['Service'].length]} stroke="rgba(15, 23, 42, 1)" strokeWidth={2} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value}h`, name]} contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} itemStyle={{color: '#f8fafc'}}/>
                                <Legend wrapperStyle={{color: '#94a3b8'}} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">Sem dados para este funcionário.</div>
                ) : (
                    topEmployeesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={topEmployeesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} fill="#8884d8" dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {topEmployeesData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS['Top'][index % PIE_COLORS['Top'].length]} stroke="rgba(15, 23, 42, 1)" strokeWidth={2} />)}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}h`} contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} itemStyle={{color: '#f8fafc'}}/>
                                <Legend wrapperStyle={{color: '#94a3b8'}} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">Não há horas extras neste período.</div>
                )}
                </ChartContainer>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;