
import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, ProductUnit, TRANSLATIONS } from '../types';
import { Plus, Edit, Trash2, Package, Hammer, Search, Ruler, Tag, Settings, Layers } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ProductsProps {
  products: Product[];
  categories: ProductCategory[];
  units: ProductUnit[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (cat: ProductCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddUnit: (unit: ProductUnit) => void;
  onDeleteUnit: (id: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ 
    products, categories, units,
    onAddProduct, onUpdateProduct, onDeleteProduct,
    onAddCategory, onDeleteCategory,
    onAddUnit, onDeleteUnit
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageType, setManageType] = useState<'categories' | 'units'>('categories');
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newItemName, setNewItemName] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const handleOpenModal = (prod?: Product) => {
    if (prod) {
      setEditingProd(prod);
      setFormData({ ...prod });
    } else {
      setEditingProd(null);
      setFormData({ type: 'material', unit: units[0]?.name || 'un', category: categories[0]?.name || 'Geral', cost: 0, price: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price !== undefined) {
      const payload: Product = {
          id: editingProd ? editingProd.id : Date.now().toString(),
          name: formData.name!,
          category: formData.category || 'Geral',
          type: formData.type || 'material',
          unit: formData.unit || 'un',
          price: Number(formData.price),
          cost: Number(formData.cost || 0),
          currentStock: editingProd ? editingProd.currentStock : 0,
          minStock: Number(formData.minStock || 5)
      };
      if (editingProd) onUpdateProduct(payload);
      else onAddProduct(payload);
      setIsModalOpen(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName) return;
    if (manageType === 'categories') {
        onAddCategory({ id: Date.now().toString(), name: newItemName });
    } else {
        onAddUnit({ id: Date.now().toString(), name: newItemName });
    }
    setNewItemName('');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Catálogo</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Produtos, Serviços e Insumos</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { setManageType('categories'); setIsManageModalOpen(true); }} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:text-vprom-dark transition-all" title="Categorias"><Tag size={20}/></button>
            <button onClick={() => { setManageType('units'); setIsManageModalOpen(true); }} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:text-vprom-dark transition-all" title="Unidades"><Ruler size={20}/></button>
            <button onClick={() => handleOpenModal()} className="bg-vprom-orange text-white px-6 py-4 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
              <Plus size={18} /> Novo Item
            </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar produto ou serviço..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map(prod => (
          <div key={prod.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-gray-50 text-vprom-dark rounded-2xl group-hover:bg-vprom-orange group-hover:text-white transition-all">
                  {prod.type === 'service' ? <Hammer size={24}/> : <Package size={24}/>}
               </div>
               <div>
                  <h4 className="text-sm font-black text-vprom-dark uppercase tracking-tight">{prod.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{prod.unit} • {prod.category}</p>
               </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-vprom-dark tracking-tighter">R$ {prod.price.toFixed(2)}</p>
              <div className="flex gap-2 justify-end mt-2">
                 <button onClick={() => handleOpenModal(prod)} className="text-gray-300 hover:text-vprom-dark transition-all"><Edit size={16}/></button>
                 <button onClick={() => onDeleteProduct(prod.id)} className="text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProd ? "Editar Item" : "Novo Cadastro"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nome do Produto ou Serviço</label>
            <input required className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-bold outline-none focus:border-vprom-orange" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Tipo</label>
                <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="material">Material / Produto</option>
                    <option value="service">Mão de Obra / Serviço</option>
                </select>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Categoria</label>
                <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    {categories.length === 0 && <option value="Geral">Geral</option>}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Unidade</label>
                <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    {units.length === 0 && <option value="un">Unidade</option>}
                </select>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Estoque Mínimo</label>
                <input type="number" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.minStock || 0} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Custo R$</label><input type="number" step="0.01" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} /></div>
            <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Venda R$</label><input required type="number" step="0.01" className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg text-vprom-orange font-black outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
          </div>
          <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4 hover:bg-vprom-orange">Salvar no Catálogo</button>
        </form>
      </Modal>

      <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title={`Gerenciar ${manageType === 'categories' ? 'Categorias' : 'Unidades'}`}>
         <div className="space-y-6">
            <div className="flex gap-2">
                <input className="flex-1 p-4 border border-gray-200 rounded-2xl text-sm font-bold" placeholder={`Nova ${manageType === 'categories' ? 'categoria' : 'unidade'}...`} value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                <button onClick={handleAddItem} className="bg-vprom-dark text-white px-6 rounded-2xl font-black uppercase text-[10px]"><Plus size={18}/></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {(manageType === 'categories' ? categories : units).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                        <button onClick={() => manageType === 'categories' ? onDeleteCategory(item.id) : onDeleteUnit(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
         </div>
      </Modal>
    </div>
  );
};
