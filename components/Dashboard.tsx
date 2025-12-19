
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { FinancialRecord, Client, Appointment, ConstructionSite, TRANSLATIONS } from '../types';
import { Wallet, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Calendar, ArrowRight, HardHat, AlertCircle, Wifi, Database, Bell, Volume2, Smartphone, ShieldCheck, Settings } from 'lucide-react';

interface DashboardProps {
  financials: FinancialRecord[];
  clients: Client[];
  appointments: Appointment[];
  constructionSites: ConstructionSite[];
  onNavigate: (tab: any) => void;
  onSetupAlerts?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ financials = [], clients = [], appointments = [], constructionSites = [], onNavigate, onSetupAlerts }) => {
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    const interval = setInterval(() => {
        setNotifPermission(Notification.permission);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const safeFinancials = Array.isArray(financials) ? financials : [];
    return safeFinancials.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
        if (curr.status === 'pending') acc.pendingIncome += curr.amount;
        if (curr.status === 'overdue') acc.overdueIncome += curr.amount;
      } else {
        acc.totalExpenses += curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, pendingIncome: 0, overdueIncome: 0 });
  }, [financials]);

  const appointmentStats = useMemo(() => {
    const safeAppointments = Array.isArray(appointments) ? appointments : [];
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;
    
    const day = today.getDay();
    const diff = today.getDate() - day;
    const startOfWeek = new Date(today.setDate(diff)).setHours(0,0,0,0);
    const endOfWeek = startOfWeek + (7 * 86400000);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let dayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    const upcoming: Appointment[] = [];

    safeAppointments.forEach(appt => {
      const apptDate = new Date(`${appt.date}T${appt.time}`);
      const apptTime = apptDate.getTime();

      if (appt.status !== 'cancelled' && appt.status !== 'closed_deal') {
        if (apptTime >= startOfDay && apptTime < endOfDay) dayCount++;
        if (apptTime >= startOfWeek && apptTime < endOfWeek) weekCount++;
        if (apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear) monthCount++;
        
        if (apptTime >= startOfDay) upcoming.push(appt);
      }
    });

    return { dayCount, weekCount, monthCount, upcoming: upcoming.sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5) };
  }, [appointments]);

  const expiringSites = useMemo(() => {
    const safeSites = Array.isArray(constructionSites) ? constructionSites : [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return safeSites.filter(site => {
      if (site.status === 'completed' || !site.expectedEndDate) return false;
      const endDateStr = site.expectedEndDate;
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      return endDateStr <= nextWeekStr; 
    }).sort((a,b) => a.expectedEndDate!.localeCompare(b.expectedEndDate!));
  }, [constructionSites]);

  const chartData = useMemo(() => {
    return [
      { name: 'Entradas', amount: stats.totalIncome },
      { name: 'Saídas', amount: stats.totalExpenses },
    ];
  }, [stats]);

  const pieData = useMemo(() => {
    const safeFinancials = Array.isArray(financials) ? financials : [];
    return [
      { name: 'Pago', value: safeFinancials.filter(f => f.status === 'paid').length, color: '#22c55e' },
      { name: 'Pendente', value: safeFinancials.filter(f => f.status === 'pending').length, color: '#f59e0b' },
      { name: 'Atrasado', value: safeFinancials.filter(f => f.status === 'overdue').length, color: '#ef4444' },
    ];
  }, [financials]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-vprom-dark">Painel de Controle</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
           <Wifi size={14} /> Sistema Online
        </div>
      </div>

      <div className={`bg-white rounded-[2.5rem] p-8 shadow-xl border-4 transition-all overflow-hidden relative ${isPWA && notifPermission === 'granted' ? 'border-green-500/10' : 'border-vprom-orange/10'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 text-vprom-orange">
          {isPWA ? <ShieldCheck size={120} className="text-green-500" /> : <Smartphone size={120} />}
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-vprom-dark uppercase tracking-tighter mb-2">
              {isPWA ? 'Proteção Técnica Ativa' : 'Configuração de Alertas'}
            </h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-md">
              {isPWA 
                ? 'O sistema está instalado e autorizado a emitir sirenes de compromissos mesmo com a tela desligada.' 
                : 'Instale o VPROM e ative as notificações para receber avisos de agenda em tempo real.'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${notifPermission === 'granted' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                  <Bell size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{notifPermission === 'granted' ? 'Alertas ON' : 'Alertas OFF'}</span>
               </div>
               <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isPWA ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                  <Smartphone size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isPWA ? 'App Instalado' : 'Modo Web'}</span>
               </div>
            </div>
          </div>
          <button 
            onClick={onSetupAlerts}
            className={`w-full md:w-auto px-10 py-6 rounded-3xl font-black uppercase tracking-[0.1em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95 ${isPWA && notifPermission === 'granted' ? 'bg-vprom-dark text-white' : 'bg-vprom-orange text-white shadow-vprom-orange/30 hover:scale-105'}`}
          >
            {isPWA && notifPermission === 'granted' ? (
              <><ShieldCheck size={20} /> Sistema Configurado</>
            ) : (
              <><Settings className="group-hover:rotate-90 transition-transform" size={20} /> Ativar Alertas Críticos</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-md p-6 text-white">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
               <Calendar className="text-vprom-orange" /> Agenda de Compromissos
             </h3>
             <button onClick={() => onNavigate('agenda')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition">
                Ver Agenda Completa <ArrowRight size={12} />
             </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-700">
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wider">Hoje</span>
              <p className="text-3xl font-bold text-vprom-orange">{appointmentStats.dayCount}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wider">Esta Semana</span>
              <p className="text-3xl font-bold text-white">{appointmentStats.weekCount}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wider">Este Mês</span>
              <p className="text-3xl font-bold text-white">{appointmentStats.monthCount}</p>
            </div>
          </div>
          
          {appointmentStats.upcoming.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Próximas Atividades</h4>
              <div className="space-y-2">
                {appointmentStats.upcoming.map(appt => {
                  const client = Array.isArray(clients) ? clients.find(c => c.id === appt.clientId) : null;
                  return (
                    <div key={appt.id} onClick={() => onNavigate('agenda')} className="flex items-center justify-between bg-gray-800/50 p-2 rounded text-sm hover:bg-gray-700 transition cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-vprom-orange font-bold w-12">{new Date(appt.date).getDate()}/{new Date(appt.date).getMonth()+1}</span>
                        <span className="text-gray-300 font-medium group-hover:text-white transition">{appt.time}</span>
                        <span className="text-white truncate">{client?.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${appt.status === 'to_visit' ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'}`}>
                        {TRANSLATIONS.appointment_status[appt.status as keyof typeof TRANSLATIONS.appointment_status] || appt.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-orange-50 rounded-lg shadow-md border border-orange-100 p-6">
           <h3 className="text-lg font-bold flex items-center gap-2 text-orange-800 mb-2">
              <HardHat className="text-orange-600" /> Obras Críticas
           </h3>
           <p className="text-sm text-gray-600 mb-4">Obras vencendo nos próximos 7 dias ou em atraso.</p>
           
           <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {expiringSites.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                   <CheckCircle className="mx-auto mb-2 text-green-500" size={32}/>
                   <p className="text-sm">Sem obras em atraso.</p>
                </div>
              ) : (
                expiringSites.map(site => {
                   const client = Array.isArray(clients) ? clients.find(c => c.id === site.clientId) : null;
                   const isLate = new Date(site.expectedEndDate!) < new Date(new Date().setHours(0,0,0,0));
                   return (
                      <div key={site.id} onClick={() => onNavigate('construction_sites')} className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm flex flex-col gap-1 cursor-pointer hover:bg-orange-100 transition group">
                         <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-orange-800">{client?.name || 'Cliente'}</h4>
                            {isLate && <AlertCircle size={16} className="text-red-500" />}
                         </div>
                         <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-gray-500 truncate">{site.address}</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${isLate ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                               {new Date(site.expectedEndDate!).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                   )
                })
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onNavigate('financials')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-vprom-orange cursor-pointer hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Receita Acumulada</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalIncome)}</p></div>
            <TrendingUp className="text-vprom-orange opacity-80" size={28} />
          </div>
        </div>
        <div onClick={() => onNavigate('financials')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-800 cursor-pointer hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Despesas Acumuladas</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p></div>
            <TrendingDown className="text-gray-800 opacity-80" size={28} />
          </div>
        </div>
        <div onClick={() => onNavigate('financials')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 cursor-pointer hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">A Receber (Atrasado)</p><p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueIncome)}</p></div>
            <AlertTriangle className="text-red-500 opacity-80" size={28} />
          </div>
        </div>
        <div onClick={() => onNavigate('financials')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">A Receber (Futuro)</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.pendingIncome)}</p></div>
            <Wallet className="text-blue-500 opacity-80" size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Fluxo Financeiro Mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#FF6B00" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#FF6B00' : '#1f2937'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Recebimentos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 flex justify-center items-center gap-2">
         <Database size={12} /> <span>Conectado ao Supabase</span> <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
      </div>
    </div>
  );
};
