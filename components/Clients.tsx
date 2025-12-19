
import React, { useState } from 'react';
import { Client, Quote, Appointment, FinancialRecord, ConstructionSite, TRANSLATIONS } from '../types';
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye, FileText, HardHat, Calendar, DollarSign, ArrowRight, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ClientsProps {
  clients: Client[];
  quotes: Quote[];
  appointments: Appointment[];
  financials: FinancialRecord[];
  constructionSites: ConstructionSite[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ 
    clients, quotes, appointments, financials, constructionSites,
    onAddClient, onUpdateClient, onDeleteClient 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'info' | 'quotes' | 'sites' | 'financial' | 'agenda'>('info');
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleOpenHistory = (client: Client) => {
    setViewingClient(client);
    setActiveHistoryTab('info');
    setIsHistoryOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.city && formData.state) {
      if (editingClient) {
        onUpdateClient({ ...editingClient, ...formData } as Client);
      } else {
        onAddClient({
          id: Date.now().toString(),
          name: formData.name!,
          email: formData.email || '',
          phone: formData.phone!,
          address: formData.address || '',
          city: formData.city!,
          state: formData.state!,
          notes: formData.notes || ''
        });
      }
      setIsModalOpen(false);
    }
  };

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); 
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhone(e.target.value) });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const renderHistoryContent = () => {
     if (!viewingClient) return null;
     const clientQuotes = quotes.filter(q => q.clientId === viewingClient.id);
     const clientSites = constructionSites.filter(s => s.clientId === viewingClient.id);
     const clientFinancials = financials.filter(f => f.clientId === viewingClient.id);
     const clientAppts = appointments.filter(a => a.clientId === viewingClient.id).sort((a,b) => b.date.localeCompare(a.date));

     switch(activeHistoryTab) {
        case 'info':
            return (
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-3xl border border-gray-200">
                        <h3 className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> Localização Principal</h3>
                        <p className="text-gray-900 font-bold">{viewingClient.address || 'Logradouro não informado'}</p>
                        <p className="text-vprom-orange font-black mt-1 uppercase text-xs">{viewingClient.city} — {viewingClient.state}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-gray-200">
                            <h3 className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2"><Phone size={14}/> Contato</h3>
                            <p className="text-gray-900 font-bold">{viewingClient.phone}</p>
                            <p className="text-gray-500 text-xs font-bold">{viewingClient.email || 'Sem e-mail'}</p>
                        </div>
                    </div>
                </div>
            );
        default: return <p className="text-center text-gray-400 py-10">Conteúdo em desenvolvimento...</p>;
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Clientes</h2>
        <button onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-vprom-orange text-white px-8 py-4 rounded-2xl hover:bg-orange-700 transition shadow-xl font-black uppercase text-xs tracking-widest">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nome, cidade ou telefone..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-[2.5rem] shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-14 w-14 rounded-2xl bg-vprom-dark text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-vprom-orange transition-colors">
                  {client.name.substring(0,2).toUpperCase()}
               </div>
               <div>
                  <h3 className="text-sm font-black text-vprom-dark uppercase tracking-tight">{client.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{client.city} • {client.state}</p>
               </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                <Phone size={14} className="text-vprom-orange" /> {client.phone}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                <MapPin size={14} className="text-vprom-orange" /> <span className="truncate">{client.address || 'Sem endereço'}</span>
              </div>
            </div>

            <div className="flex gap-2">
                 <button onClick={() => handleOpenHistory(client)} className="flex-1 bg-vprom-dark text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Histórico</button>
                 <button onClick={() => handleOpenModal(client)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-vprom-orange hover:text-white transition-all"><Edit size={18} /></button>
                 <button onClick={() => onDeleteClient(client.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Editar Cliente" : "Novo Cadastro"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nome Completo</label>
            <input required type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none focus:ring-2 focus:ring-vprom-orange/20 focus:border-vprom-orange" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Telefone</label>
              <input required type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.phone || ''} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" maxLength={15} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">E-mail</label>
              <input type="email" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
               <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Cidade</label>
               <input required type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">UF</label>
               <input required type="text" maxLength={2} className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none uppercase" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Endereço de Obra</label>
            <input type="text" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Notas Internas</label>
            <textarea className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" rows={3} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Salvar Cliente</button>
        </form>
      </Modal>

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title={`Histórico: ${viewingClient?.name}`}>
         <div className="flex flex-col h-[60vh]">
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto">
                {['info', 'quotes', 'sites', 'financial', 'agenda'].map((tab) => (
                    <button key={tab} onClick={() => setActiveHistoryTab(tab as any)} className={`flex-1 px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeHistoryTab === tab ? 'bg-white text-vprom-dark shadow-sm' : 'text-gray-400'}`}>
                      {tab === 'info' ? 'Dados' : tab === 'quotes' ? 'Orçamentos' : tab === 'sites' ? 'Obras' : tab === 'financial' ? 'Financeiro' : 'Agenda'}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">{renderHistoryContent()}</div>
         </div>
      </Modal>
    </div>
  );
};
