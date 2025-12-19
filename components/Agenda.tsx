
import React, { useState, useMemo } from 'react';
import { Appointment, Client, AppointmentStatus, Staff, TRANSLATIONS } from '../types';
import { Plus, Calendar, Clock, MapPin, CheckCircle, Search, User, XCircle } from 'lucide-react';
import { Modal } from './ui/Modal';

interface AgendaProps {
  appointments: Appointment[];
  clients: Client[];
  staff: Staff[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointment: (appt: Appointment) => void;
  onCreateQuoteFromAppointment: (clientId: string) => void;
}

export const Agenda: React.FC<AgendaProps> = ({ 
  appointments, clients, staff,
  onAddAppointment, onUpdateAppointment
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<Partial<Appointment>>({ status: 'solicited', date: new Date().toISOString().split('T')[0] });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const client = clients.find(c => c.id === appt.clientId);
      const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, clients, searchTerm, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientId && formData.date && formData.time) {
      onAddAppointment({
        id: Date.now().toString(),
        clientId: formData.clientId!,
        staffId: formData.staffId,
        date: formData.date!,
        time: formData.time!,
        address: formData.address || '',
        description: formData.description || '',
        status: formData.status as AppointmentStatus || 'solicited'
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Agenda</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-vprom-orange text-white px-6 py-4 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
          <Plus size={20} /> Agendar Visita
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm text-xs font-black text-gray-600 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos Status</option>
              {Object.entries(TRANSLATIONS.appointment_status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
      </div>

      <div className="grid gap-4">
        {filteredAppointments.map(appt => {
          const client = clients.find(c => c.id === appt.clientId);
          return (
            <div key={appt.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-vprom-orange/10 text-vprom-orange text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-vprom-orange/20">{TRANSLATIONS.appointment_status[appt.status]}</span>
                    <h3 className="text-sm font-black text-vprom-dark uppercase">{client?.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 font-bold uppercase">
                    <div className="flex items-center gap-1.5"><Calendar size={14}/>{new Date(appt.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><Clock size={14}/>{appt.time}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={14}/>{appt.address}</div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => onUpdateAppointment({...appt, status: 'visited'})} className="flex-1 md:flex-none p-3 bg-gray-50 text-vprom-dark rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-vprom-orange hover:text-white transition-all">Concluir</button>
                  <button onClick={() => onUpdateAppointment({...appt, status: 'cancelled'})} className="p-3 bg-red-50 text-red-500 rounded-2xl transition-all"><XCircle size={18} /></button>
                </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Nova Visita">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Cliente</label>
            <select required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.clientId || ''} onChange={e => setFormData({...formData, clientId: e.target.value, address: clients.find(c => c.id === e.target.value)?.address})}>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Data</label><input required type="date" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Hora</label><input required type="time" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
          </div>
          <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Local / Obra</label><input required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Observações</label><textarea className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <button type="submit" className="w-full bg-vprom-orange text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Confirmar Agendamento</button>
        </form>
      </Modal>
    </div>
  );
};
