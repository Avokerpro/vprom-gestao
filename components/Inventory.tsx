
import React, { useState, useMemo } from 'react';
import { Product, StockMovement, ConstructionSite, TRANSLATIONS } from '../types';
import { Plus, Minus, Search, History, Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, Calendar, User, Tag } from 'lucide-react';
import { Modal } from './ui/Modal';

interface InventoryProps {
  products: Product[];
  movements: StockMovement[];
  sites: ConstructionSite[];
  onAddMovement: (movement: StockMovement) => void;
  onUpdateProduct: (product: Product) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products = [], movements = [], sites = [], onAddMovement, onUpdateProduct }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  
  const [formData, setFormData] = useState({
    quantity: 0,
    reason: '',
    siteId: ''
  });

  const filteredMaterials = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter(p => p.type === 'material' && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const recentMovements = useMemo(() => {
    const list = Array.isArray(movements) ? movements : [];
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements]);

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || formData.quantity <= 0) return;

    const newMovement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      quantity: formData.quantity,
      type: movementType,
      date: new Date().toISOString(),
      reason: formData.reason,
      siteId: formData.siteId || undefined
    };

    // 1. Registra a movimentação
    onAddMovement(newMovement);

    // 2. Calcula e atualiza o saldo do produto (Garante que usamos o valor atual ou 0)
    const updatedProduct = { 
      ...selectedProduct,
      currentStock: Number(selectedProduct.currentStock || 0) + (movementType === 'in' ? formData.quantity : -formData.quantity)
    };
    
    onUpdateProduct(updatedProduct);

    setIsModalOpen(false);
    setFormData({ quantity: 0, reason: '', siteId: '' });
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Almoxarifado</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Gestão de Materiais & Chapas</p>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
        <button onClick={() => setActiveTab('stock')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-vprom-dark text-white' : 'text-gray-400'}`}>Saldos Atuais</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-vprom-dark text-white' : 'text-gray-400'}`}>Histórico Global</button>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredMaterials.map(product => {
              const currentBalance = Number(product.currentStock || 0);
              const minBalance = Number(product.minStock || 5);
              const isLowStock = currentBalance <= minBalance;
              return (
                <div key={product.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-vprom-orange'}`}>
                        <Package size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-vprom-dark uppercase">{product.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tighter ${isLowStock ? 'text-red-500' : 'text-vprom-dark'}`}>
                        {currentBalance} <span className="text-xs uppercase opacity-50">{product.unit}</span>
                      </p>
                      {isLowStock && <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Estoque Baixo!</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setSelectedProduct(product); setMovementType('in'); setIsModalOpen(true); }} className="bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-all">
                      <Plus size={14}/> Registrar Compra
                    </button>
                    <button onClick={() => { setSelectedProduct(product); setMovementType('out'); setIsModalOpen(true); }} className="bg-vprom-dark text-white py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transition-all">
                      <Minus size={14}/> Saída para Obra
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
          {recentMovements.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-dashed border-gray-200">
               <History size={48} className="mx-auto mb-4 text-gray-200" />
               <p className="text-sm text-gray-400 font-bold uppercase">Nenhuma movimentação registrada</p>
            </div>
          ) : recentMovements.map(m => {
            const product = products.find(p => p.id === m.productId);
            const site = sites.find(s => s.id === m.siteId);
            return (
              <div key={m.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${m.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {m.type === 'in' ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-vprom-dark uppercase">{product?.name || 'Item Excluído'}</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      {new Date(m.date).toLocaleDateString()} • {m.reason || (m.type === 'in' ? 'Entrada de Estoque' : 'Saída Obra')}
                    </p>
                    {site && <p className="text-[8px] text-vprom-orange font-black uppercase mt-1">Obra: {site.address}</p>}
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-sm font-black ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                     {m.type === 'in' ? '+' : '-'}{m.quantity} {product?.unit}
                   </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={movementType === 'in' ? 'Entrada de Material' : 'Saída para Obra'}>
        <form onSubmit={handleMovementSubmit} className="space-y-6">
           <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Produto em Manuseio</p>
              <h5 className="text-vprom-dark text-lg font-black uppercase tracking-tight">{selectedProduct?.name}</h5>
           </div>

           <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Quantidade a {movementType === 'in' ? 'Adicionar' : 'Retirar'}</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-2xl font-black text-vprom-dark outline-none focus:ring-2 focus:ring-vprom-orange/20" 
                  value={formData.quantity || ''} 
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>

              {movementType === 'out' && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Destino (Vincular à Obra)</label>
                  <select 
                    className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-700 outline-none" 
                    value={formData.siteId} 
                    onChange={e => setFormData({...formData, siteId: e.target.value})}
                  >
                    <option value="">Uso Geral / Sem Obra Específica</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.address}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Justificativa ou Observação</label>
                <textarea 
                  className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none placeholder-gray-400" 
                  rows={3} 
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                  placeholder="Ex: Carga do fornecedor X / Retirada para montagem externa..."
                />
              </div>
           </div>

           <button type="submit" className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all text-white ${movementType === 'in' ? 'bg-green-600' : 'bg-vprom-dark'}`}>
             Confirmar Movimentação de Estoque
           </button>
        </form>
      </Modal>
    </div>
  );
};
