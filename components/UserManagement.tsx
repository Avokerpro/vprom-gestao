
import React, { useState, useMemo } from 'react';
import { AppUser, AppRole, ALL_TABS } from '../types';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
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
    users, roles, onAddUser, onUpdateUser, onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState<Partial<AppUser>>({ allowedTabs: [] });

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  const handleOpenModal = (user?: AppUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({ role: 'seller', allowedTabs: ['dashboard'] });
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
            allowedCities: formData.allowedCities || []
        };
        if (editingUser) onUpdateUser(payload);
        else onAddUser(payload);
        setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Acessos</h2>
        <button onClick={() => handleOpenModal()} className="bg-vprom-dark text-white px-6 py-4 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar usuário..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-vprom-dark font-black">
                  {user.name.substring(0,1).toUpperCase()}
               </div>
               <div>
                  <h4 className="text-sm font-black text-vprom-dark uppercase">{user.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{user.role} • {user.email}</p>
               </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(user)} className="text-gray-300 hover:text-vprom-dark transition-all"><Edit size={18}/></button>
                <button onClick={() => onDeleteUser(user.id)} className="text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Editar Usuário" : "Novo Usuário"}>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">E-mail</label>
                <input required type="email" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nome</label>
                <input required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nível de Função</label>
                {/* Cast e.target.value to AppRole to fix string to union type assignment error */}
                <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as AppRole})}>
                  <option value="seller">Vendedor</option>
                  <option value="technician">Técnico</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="programmer">Root</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Salvar Usuário</button>
          </form>
      </Modal>
    </div>
  );
};
