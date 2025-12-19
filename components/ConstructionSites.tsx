
import React, { useState, useMemo } from 'react';
import { ConstructionSite, Client, Staff, ConstructionStatus, TRANSLATIONS } from '../types';
import { Plus, Edit, Trash2, HardHat, Calendar, MapPin, Search, Navigation, Info, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ConstructionSitesProps {
  sites: ConstructionSite[];
  clients: Client[];
  staff: Staff[];
  onAddSite: (site: ConstructionSite) => void;
  onUpdateSite: (site: ConstructionSite) => void;
  onDeleteSite: (id: string) => void;
}

export const ConstructionSites: React.FC<ConstructionSitesProps> = ({ 
  sites = [], clients = [], staff = [], onAddSite, onUpdateSite, onDeleteSite 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);
  const [formData, setFormData] = useState<Partial<ConstructionSite>>({ status: 'planning' });

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const client = clients.find(c => c.id === site.clientId);
      return client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             site.address.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sites, clients, searchTerm]);

  const handleOpenModal = (site?: ConstructionSite) => {
    if (site) {
      setEditingSite(site);
      setFormData(site);
    } else {
      setEditingSite(null);
      setFormData({ status: 'planning', startDate: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientId && formData.startDate && formData.address) {
      const payload: ConstructionSite = {
        id: editingSite ? editingSite.id : Date.now().toString(),
        clientId: formData.clientId!,
        address: String(formData.address),
        startDate: formData.startDate!,
        expectedEndDate: formData.expectedEndDate,
        status: formData.status as ConstructionStatus,
        description: formData.description || '',
        sellerId: formData.sellerId,
        technicianId: formData.technicianId
      };
      if (editingSite) onUpdateSite(payload);
      else onAddSite(payload);
      setIsModalOpen(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'completed': return 'bg-green-50 text-green-600 border-green-100';
        case 'paused': return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Obras</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Acompanhamento de Canteiro</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-vprom-orange text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar obra, endereço ou cliente..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSites.map(site => {
          const client = clients.find(c => c.id === site.clientId);
          const technician = staff.find(s => s.id === site.technicianId);
          return (
            <div key={site.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
               <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusStyle(site.status)}`}>
                        {TRANSLATIONS.construction_status[site.status as keyof typeof TRANSLATIONS.construction_status]}
                    </span>
                    <HardHat size={28} className="text-vprom-dark group-hover:text-vprom-orange transition-colors" />
                  </div>
                  
                  <h3 className="text-sm font-black text-vprom-dark uppercase tracking-tight mb-2">{client?.name || 'Cliente Indefinido'}</h3>
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-vprom-orange" />
                    <span className="truncate">{site.address}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl mb-6">
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Início</p>
                        <p className="text-xs font-bold text-vprom-dark">{new Date(site.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Técnico</p>
                        <p className="text-xs font-bold text-vprom-dark truncate">{technician?.name || 'Não atribuído'}</p>
                    </div>
                  </div>
               </div>

               <div className="flex gap-2 border-t pt-6 border-gray-50">
                 <button onClick={() => handleOpenModal(site)} className="flex-1 flex items-center justify-center gap-2 bg-vprom-dark text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"><Edit size={14}/> Editar Obra</button>
                 <button onClick={() => onDeleteSite(site.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
               </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSite ? "Atualizar Obra" : "Nova Obra em Campo"}>
         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Cliente da Obra</label>
              <select required className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-vprom-orange" value={formData.clientId || ''} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-vprom-orange" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Número, Bairro, Cidade..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Data Início</label>
                  <input required type="date" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold shadow-sm outline-none" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Previsão Entrega</label>
                  <input type="date" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold shadow-sm outline-none" value={formData.expectedEndDate || ''} onChange={e => setFormData({...formData, expectedEndDate: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Status Atual</label>
                  <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold shadow-sm outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    {Object.entries(TRANSLATIONS.construction_status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Vendedor</label>
                  <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold shadow-sm outline-none" value={formData.sellerId || ''} onChange={e => setFormData({...formData, sellerId: e.target.value})}>
                    <option value="">Nenhum</option>
                    {staff.filter(s => s.role === 'seller').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Responsável Técnico</label>
                  <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold shadow-sm outline-none" value={formData.technicianId || ''} onChange={e => setFormData({...formData, technicianId: e.target.value})}>
                    <option value="">Nenhum</option>
                    {staff.filter(s => s.role === 'technician' || s.role === 'supervisor').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Observações da Obra</label>
               <textarea className="w-full p-5 bg-white border border-gray-200 rounded-[2rem] text-sm font-bold shadow-sm outline-none focus:border-vprom-orange" rows={4} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Peculiaridades do terreno, vizinhos, restrições de horário..." />
            </div>

            <button type="submit" className="w-full bg-vprom-dark text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all mt-4 hover:bg-vprom-orange">Salvar Cadastro de Obra</button>
         </form>
      </Modal>
    </div>
  );
};
