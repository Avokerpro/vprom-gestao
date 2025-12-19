
import React, { useState, useRef, useMemo } from 'react';
import { ConstructionSite, Client, Staff, ConstructionStatus, TRANSLATIONS } from '../types';
import { Plus, Edit, Trash2, HardHat, Calendar, MapPin, Search, Navigation, Loader2 } from 'lucide-react';
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
  sites, clients, staff, onAddSite, onUpdateSite, onDeleteSite 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);
  const [formData, setFormData] = useState<Partial<ConstructionSite>>({ status: 'planning' });
  const [loadingGeo, setLoadingGeo] = useState(false);

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const client = clients.find(c => c.id === site.clientId);
      return client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || site.address.toLowerCase().includes(searchTerm.toLowerCase());
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
        status: formData.status as ConstructionStatus,
        description: formData.description || ''
      };
      if (editingSite) onUpdateSite(payload);
      else onAddSite(payload);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Obras</h2>
        <button onClick={() => handleOpenModal()} className="bg-vprom-orange text-white px-6 py-4 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
          <Plus size={20} /> Nova Obra
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar obra ou endereço..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredSites.map(site => {
          const client = clients.find(c => c.id === site.clientId);
          return (
            <div key={site.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-100">{TRANSLATIONS.construction_status[site.status]}</span>
                    <h3 className="text-sm font-black text-vprom-dark uppercase">{client?.name}</h3>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2"><MapPin size={12} className="text-vprom-orange" />{site.address}</div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleOpenModal(site)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-vprom-dark transition-all"><Edit size={18}/></button>
                 <button onClick={() => onDeleteSite(site.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl transition-all"><Trash2 size={18}/></button>
               </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSite ? "Editar Registro" : "Nova Obra"}>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Cliente</label>
              <select required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.clientId || ''} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Endereço da Obra</label>
              <input required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Data Início</label><input required type="date" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Status</label>
                  <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    {Object.entries(TRANSLATIONS.construction_status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
               </div>
            </div>
            <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Salvar Obra</button>
         </form>
      </Modal>
    </div>
  );
};
