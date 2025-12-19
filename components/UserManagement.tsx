
import React, { useState, useMemo } from 'react';
import { AppUser, AppRole, ALL_TABS } from '../types';
import { Plus, Edit, Trash2, Search, Shield, Settings, UserCheck } from 'lucide-react';
import { Modal } from './ui/Modal';

interface UserManagementProps {
  users: AppUser[];
  roles: AppRole[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  onAddRole: (role: AppRole) => void;
  onDeleteRole: (id: string) => void;
  currentUserRole: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
    users, roles, onAddUser, onUpdateUser, onDeleteUser, onAddRole, onDeleteRole
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState<Partial<AppUser>>({ allowedTabs: [] });
  const [newRoleName, setNewRoleName] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  const handleOpenModal = (user?: AppUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({ role: roles[0]?.name || 'seller', allowedTabs: ['dashboard'], allowedCities: ['Todas'] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.role) {
        const payload: AppUser = {
            id: editingUser ? editingUser.id : Date.now().toString(),
            email: formData.email!,
            name: formData.name || 'Usuário',
            role: formData.role!,
            allowedTabs: formData.allowedTabs || [],
            allowedCities: formData.allowedCities || ['Todas']
        };
        if (editingUser) onUpdateUser(payload);
        else onAddUser(payload);
        setIsModalOpen(false);
    }
  };

  const toggleTab = (tabId: string) => {
    const currentTabs = formData.allowedTabs || [];
    if (currentTabs.includes(tabId)) {
        setFormData({...formData, allowedTabs: currentTabs.filter(id => id !== tabId)});
    } else {
        setFormData({...formData, allowedTabs: [...currentTabs, tabId]});
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Acessos</h2>
            <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Gestão de Usuários e Permissões</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsRoleModalOpen(true)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:text-vprom-dark transition-all" title="Gerenciar Funções"><Settings size={20}/></button>
            <button onClick={() => handleOpenModal()} className="bg-vprom-dark text-white px-6 py-4 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
              <Plus size={18} /> Novo Usuário
            </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar usuário por nome ou e-mail..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-vprom-orange font-black text-xl border border-gray-100 shadow-inner">
                  {user.name.substring(0,1).toUpperCase()}
               </div>
               <div>
                  <h4 className="text-sm font-black text-vprom-dark uppercase tracking-tight">{user.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user.role} • {user.email}</p>
                  <div className="flex gap-1 mt-2">
                    {(user.allowedTabs || []).slice(0,3).map(tab => (
                        <span key={tab} className="text-[6px] font-black uppercase px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">{tab}</span>
                    ))}
                    {(user.allowedTabs || []).length > 3 && <span className="text-[6px] font-black uppercase px-1.5 py-0.5 bg-vprom-orange/10 text-vprom-orange rounded-full">+{(user.allowedTabs || []).length - 3}</span>}
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(user)} className="p-3 text-gray-300 hover:text-vprom-dark hover:bg-gray-50 rounded-xl transition-all"><Edit size={18}/></button>
                <button onClick={() => onDeleteUser(user.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Editar Credenciais" : "Novo Acesso ao Sistema"}>
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">E-mail de Acesso</label>
                    <input required type="email" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-bold outline-none focus:border-vprom-orange" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Nome do Usuário</label>
                    <input required className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-bold outline-none focus:border-vprom-orange" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Função / Cargo Principal</label>
                <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-vprom-orange" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  <option value="programmer">Root / Programador</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-3 block tracking-widest">Abas do Sistema Permitidas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_TABS.map(tab => (
                        <button key={tab.id} type="button" onClick={() => toggleTab(tab.id)} className={`p-4 rounded-2xl border text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-between ${formData.allowedTabs?.includes(tab.id) ? 'bg-vprom-dark text-white border-vprom-dark shadow-lg' : 'bg-white text-gray-400 border-gray-200'}`}>
                            {tab.label}
                            {formData.allowedTabs?.includes(tab.id) && <UserCheck size={14}/>}
                        </button>
                    ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-vprom-dark text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all mt-4 hover:bg-vprom-orange">Finalizar Configuração de Acesso</button>
          </form>
      </Modal>

      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Gerenciar Cargos / Funções">
         <div className="space-y-6">
            <div className="flex gap-2">
                <input className="flex-1 p-4 border border-gray-200 rounded-2xl text-sm font-bold" placeholder="Novo cargo..." value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                <button onClick={() => { if(newRoleName) { onAddRole({id: Date.now().toString(), name: newRoleName}); setNewRoleName(''); } }} className="bg-vprom-dark text-white px-6 rounded-2xl font-black uppercase text-[10px]"><Plus size={18}/></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {roles.map(role => (
                    <div key={role.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-widest">{role.name}</span>
                        <button onClick={() => onDeleteRole(role.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
         </div>
      </Modal>
    </div>
  );
};
