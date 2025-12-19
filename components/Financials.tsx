
import React, { useState, useMemo } from 'react';
import { FinancialRecord, Client, TRANSLATIONS, TransactionType, FinancialCategoryGroup, ConstructionSite } from '../types';
import { Plus, ArrowUpCircle, ArrowDownCircle, Search, Percent } from 'lucide-react';
import { Modal } from './ui/Modal';

interface FinancialsProps {
  financials: FinancialRecord[];
  clients: Client[];
  constructionSites?: ConstructionSite[];
  onAddTransaction: (record: FinancialRecord) => void;
  onUpdateTransaction: (record: FinancialRecord) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ financials, onAddTransaction }) => {
  const [activeView, setActiveView] = useState<'flow' | 'dre'>('flow');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FinancialRecord>>({ 
    type: 'income', status: 'pending', categoryGroup: 'rev_vendas',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredFlow = useMemo(() => {
    return financials.filter(f => f.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [financials, searchTerm]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Financeiro</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Contabilidade de Obra</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-vprom-orange text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-white p-1 rounded-2xl border border-gray-200">
        <button onClick={() => setActiveView('flow')} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'flow' ? 'bg-vprom-dark text-white' : 'text-gray-400'}`}>Caixa Diário</button>
        <button onClick={() => setActiveView('dre')} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'dre' ? 'bg-vprom-dark text-white' : 'text-gray-400'}`}>DRE Anual</button>
      </div>

      {activeView === 'flow' ? (
        <div className="space-y-4">
          <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar histórico..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm border-none outline-none text-gray-900 font-bold placeholder-gray-300" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredFlow.map(f => (
              <div key={f.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${f.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {f.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-vprom-dark uppercase tracking-tight">{f.description}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(f.dueDate).toLocaleDateString()} • {TRANSLATIONS.financial_category[f.categoryGroup]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg tracking-tighter ${f.type === 'income' ? 'text-vprom-dark' : 'text-red-500'}`}>{formatCurrency(f.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 text-center">
            <p className="text-gray-400 font-bold uppercase text-xs">Relatório DRE em preparação para o período.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
        <form onSubmit={(e) => { e.preventDefault(); if(formData.amount) { onAddTransaction({id: Date.now().toString(), ...formData as any}); setIsModalOpen(false); } }} className="space-y-5">
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}>Entrada</button>
            <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>Saída</button>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Descrição</label>
            <input required className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 font-bold outline-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Valor R$</label>
              <input required type="number" step="0.01" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-lg font-black text-vprom-dark outline-none" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Data</label>
              <input required type="date" className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Categoria</label>
            <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-800 outline-none" value={formData.categoryGroup} onChange={e => setFormData({...formData, categoryGroup: e.target.value as any})}>
              {Object.entries(TRANSLATIONS.financial_category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-vprom-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Registrar no Fluxo</button>
        </form>
      </Modal>
    </div>
  );
};
