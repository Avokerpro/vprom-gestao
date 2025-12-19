
import React, { useState, useMemo } from 'react';
import { Quote, Client, Product, Staff, TRANSLATIONS } from '../types';
import { Plus, Trash2, Search, Edit, FileText, CheckCircle2, Wand2, Loader2, Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal';
import { generateQuoteDescription } from '../services/geminiService';

interface QuotesProps {
  quotes: Quote[];
  clients: Client[];
  products: Product[];
  staff: Staff[];
  onAddQuote: (quote: Quote) => void;
  onUpdateQuote: (quote: Quote) => void;
}

export const Quotes: React.FC<QuotesProps> = ({ quotes = [], clients = [], products = [], staff = [], onAddQuote, onUpdateQuote }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedItems, setSelectedItems] = useState<{productId: string, qty: number}[]>([]);
  const [generatedDesc, setGeneratedDesc] = useState('');

  const currentTotal = useMemo(() => {
    const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];
    const safeProducts = Array.isArray(products) ? products : [];
    return safeSelectedItems.reduce((acc, item) => {
      const prod = safeProducts.find(p => p.id === item.productId);
      return acc + (prod ? prod.price * item.qty : 0);
    }, 0);
  }, [selectedItems, products]);

  const handleGenerateAi = async () => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const client = safeClients.find(c => c.id === selectedClient);
    if (!client || !Array.isArray(selectedItems) || selectedItems.length === 0) return;
    
    setIsAiLoading(true);
    const safeProducts = Array.isArray(products) ? products : [];
    const itemsForAi = selectedItems.map(si => ({
      product: safeProducts.find(p => p.id === si.productId)!,
      qty: si.qty
    })).filter(i => i.product);
    
    const desc = await generateQuoteDescription(client.name, itemsForAi);
    setGeneratedDesc(desc);
    setIsAiLoading(false);
  };

  const handleSave = () => {
    if (!selectedClient || !Array.isArray(selectedItems) || selectedItems.length === 0) return;
    const safeProducts = Array.isArray(products) ? products : [];
    const quote: Quote = {
      id: Date.now().toString(),
      clientId: selectedClient,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: selectedItems.map(i => ({ 
        productId: i.productId, 
        quantity: i.qty, 
        unitPrice: safeProducts.find(p => p.id === i.productId)?.price || 0 
      })),
      total: currentTotal,
      technicalDescription: generatedDesc
    };
    onAddQuote(quote);
    setIsModalOpen(false);
    setSelectedItems([]);
    setGeneratedDesc('');
  };

  const filteredQuotes = useMemo(() => {
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    return safeQuotes; // Placeholder if search is implemented later
  }, [quotes]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Propostas</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Orçamentos Técnicos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-vprom-orange text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[2.5rem] border border-dashed border-gray-200">
             <FileText size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="text-sm text-gray-400 font-bold uppercase">Nenhum orçamento emitido</p>
          </div>
        ) : filteredQuotes.map(q => {
          const client = Array.isArray(clients) ? clients.find(c => c.id === q.clientId) : null;
          const itemCount = Array.isArray(q.items) ? q.items.length : 0;
          return (
            <div key={q.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-vprom-dark uppercase">{client?.name || 'Cliente Desconhecido'}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(q.date).toLocaleDateString()} • {itemCount} itens</p>
                <div className="mt-2">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${q.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>{TRANSLATIONS.quote_status[q.status as keyof typeof TRANSLATIONS.quote_status] || q.status}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-vprom-orange tracking-tighter">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.total)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Proposta Técnica">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Selecionar Cliente</label>
            <select 
              className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-vprom-orange/20" 
              value={selectedClient} 
              onChange={e => setSelectedClient(e.target.value)}
            >
              <option value="">Escolha um cliente...</option>
              {Array.isArray(clients) && clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-[2.5rem] shadow-sm">
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Lista de Itens e Serviços</h5>
            <select 
              className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 outline-none mb-4" 
              onChange={e => { 
                if(e.target.value) { 
                  setSelectedItems([...selectedItems, {productId: e.target.value, qty: 1}]); 
                  e.target.value = ''; 
                } 
              }}
            >
              <option value="">Adicionar Item ou Serviço...</option>
              {Array.isArray(products) && products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {Array.isArray(selectedItems) && selectedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-800">{Array.isArray(products) ? products.find(p => p.id === item.productId)?.name : 'Item'}</span>
                  <button onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))} className="text-red-400 p-1 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <label className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">
              Descrição Técnica Detalhada
              <button onClick={handleGenerateAi} disabled={isAiLoading || !selectedClient} className="flex items-center gap-1 text-vprom-orange font-black uppercase text-[8px] hover:text-orange-600 transition-all disabled:opacity-50">
                {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Gerar com IA
              </button>
            </label>
            <textarea 
              className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-vprom-orange/20 placeholder-gray-300" 
              rows={4} 
              value={generatedDesc} 
              onChange={e => setGeneratedDesc(e.target.value)} 
              placeholder="Descreva as particularidades técnicas desta obra..."
            />
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[2.5rem] border border-dashed border-gray-200">
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase">Valor Projetado</p>
              <p className="text-3xl font-black text-vprom-dark tracking-tighter">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal)}</p>
            </div>
            <button onClick={handleSave} className="bg-vprom-dark text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Emitir Proposta</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
