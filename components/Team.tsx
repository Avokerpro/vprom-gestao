
import React, { useState, useMemo } from 'react';
import { Staff, TRANSLATIONS } from '../types';
import { Plus, Edit, Trash2, Phone, Search, Circle, MapPin, Mail } from 'lucide-react';
import { Modal } from './ui/Modal';

interface TeamProps {
  staff: Staff[];
  onAddStaff: (member: Staff) => void;
  onUpdateStaff: (member: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export const Team: React.FC<TeamProps> = ({ staff = [], onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({ role: 'installer', status: 'available' });

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'available': return { color: 'text-green-500', bg: 'bg-green-50', label: 'Livre' };
      case 'on_site': return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Em Obra' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-50', label: 'Indisp.' };
    }
  };

  const filteredStaff = useMemo(() => {
    const list = Array.isArray(staff) ? staff : [];
    return list.filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [staff, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      const payload: Staff = {
        id: editingMember ? editingMember.id : Date.now().toString(),
        name: formData.name!,
        role: formData.role!,
        specialty: formData.specialty,
        phone: formData.phone || '',
        email: formData.email || '',
        address: formData.address || '',
        status: formData.status as any || 'available'
      };
      if (editingMember) onUpdateStaff(payload);
      else onAddStaff(payload);
      setIsModalOpen(false);
      setFormData({ role: 'installer', status: 'available' });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Time VPROM</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Equipe Operacional</p>
        </div>
        <button onClick={() => { setEditingMember(null); setFormData({ role: 'installer', status: 'available' }); setIsModalOpen(true); }} className="bg-vprom-dark text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar colaborador..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStaff.map(member => {
          const status = getStatusInfo(member.status);
          return (
            <div key={member.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl ${status.bg} ${status.color} text-[8px] font-black uppercase tracking-widest`}>
                <div className="flex items-center gap-1.5">
                   <Circle size={8} fill="currentColor" /> {status.label}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 pt-4">
                <div className="h-16 w-16 rounded-[1.5rem] bg-vprom-dark text-white flex items-center justify-center font-black text-xl shadow-lg border-4 border-white">
                  {member.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-black text-vprom-dark uppercase tracking-tight">{member.name}</h4>
                  <p className="text-[9px] font-black text-vprom-orange uppercase">{TRANSLATIONS.roles[member.role as keyof typeof TRANSLATIONS.roles] || member.role}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-800 font-bold">
                   <Phone size={14} className="text-vprom-orange" /> {member.phone}
                </div>
                {member.address && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                     <MapPin size={12} className="text-gray-400" /> <span className="truncate">{member.address}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                 <button onClick={() => { setEditingMember(member); setFormData(member); setIsModalOpen(true); }} className="flex-1 py-3 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-vprom-dark hover:bg-vprom-orange hover:text-white transition-all">Editar</button>
                 <button onClick={() => onDeleteStaff(member.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? "Editar Perfil" : "Novo Colaborador"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Nome Completo</label>
            <input required type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none focus:ring-2 focus:ring-vprom-orange/20" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Cargo</label>
              <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                {Object.entries(TRANSLATIONS.roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Status</label>
              <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                {Object.entries(TRANSLATIONS.staff_status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Telefone</label>
              <input required type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">E-mail</label>
              <input type="email" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Endereço Residencial</label>
            <input type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Número, Bairro, Cidade..." />
          </div>

          <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all mt-4">
            Salvar Colaborador
          </button>
        </form>
      </Modal>
    </div>
  );
};
