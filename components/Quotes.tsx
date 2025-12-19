
import React, { useState, useMemo } from 'react';
import { Quote, Client, Product, Staff, TRANSLATIONS } from '../types';
import { Plus, Trash2, MessageCircle, Mail, Printer, Eye, Share2 } from 'lucide-react';
import { Modal } from './ui/Modal';

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedItems, setSelectedItems] = useState<{productId: string, qty: number}[]>([]);
  const [technicalDesc, setTechnicalDesc] = useState('');

  const currentTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? prod.price * item.qty : 0);
    }, 0);
  }, [selectedItems, products]);

  const handleSave = () => {
    if (!selectedClient || selectedItems.length === 0) return;
    const quote: Quote = {
      id: Date.now().toString(),
      clientId: selectedClient,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: selectedItems.map(i => ({ 
        productId: i.productId, 
        quantity: i.qty, 
        unitPrice: products.find(p => p.id === i.productId)?.price || 0 
      })),
      total: currentTotal,
      technicalDescription: technicalDesc
    };
    onAddQuote(quote);
    setIsModalOpen(false);
    setSelectedItems([]);
    setTechnicalDesc('');
    setSelectedClient('');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleShareWhatsApp = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    if (!client) return;
    
    const text = `*PROPOSTA VPROM - REVESTIMENTOS CIMENTÍCIOS*\n\n` +
      `Olá ${client.name},\n` +
      `Seguem os detalhes da proposta técnica conforme conversamos:\n\n` +
      `*Memorial Técnico:*\n${quote.technicalDescription || 'Conforme projeto.'}\n\n` +
      `*Investimento:* ${formatCurrency(quote.total)}\n\n` +
      `Ficamos à disposição para agendar o início da obra!`;
    
    const encoded = encodeURIComponent(text);
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
  };

  const handleShareEmail = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    if (!client || !client.email) return alert("Cliente sem e-mail cadastrado.");
    
    const subject = encodeURIComponent("Proposta Técnica VPROM");
    const body = encodeURIComponent(`Olá ${client.name},\n\nSegue proposta no valor de ${formatCurrency(quote.total)}.\n\nDetalhes:\n${quote.technicalDescription}`);
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Propostas</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Orçamentos & Memorial Técnico</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-vprom-orange text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {quotes.map(q => {
          const client = clients.find(c => c.id === q.clientId);
          return (
            <div key={q.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-black text-vprom-dark uppercase">{client?.name || 'Cliente'}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(q.date).toLocaleDateString()} • {formatCurrency(q.total)}</p>
                <div className="mt-2">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${q.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                     {TRANSLATIONS.quote_status[q.status as keyof typeof TRANSLATIONS.quote_status] || q.status}
                   </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedQuote(q); setIsViewModalOpen(true); }} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-vprom-dark" title="Visualizar"><Eye size={18}/></button>
                <button onClick={() => handleShareWhatsApp(q)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="Enviar WhatsApp"><MessageCircle size={18}/></button>
                <button onClick={() => handleShareEmail(q)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Enviar E-mail"><Mail size={18}/></button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Proposta Técnica">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-2">Cliente</label>
            <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">Escolha um cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-[2.5rem]">
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Produtos e Serviços</h5>
            <select className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-xs font-bold mb-4" onChange={e => { if(e.target.value) { setSelectedItems([...selectedItems, {productId: e.target.value, qty: 1}]); e.target.value = ''; } }}>
              <option value="">Adicionar Item...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
            </select>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-800">{products.find(p => p.id === item.productId)?.name}</span>
                  <div className="flex items-center gap-3">
                     <input type="number" className="w-16 p-1 text-center bg-white border rounded text-xs" value={item.qty} onChange={e => {
                        const newItems = [...selectedItems];
                        newItems[idx].qty = Number(e.target.value);
                        setSelectedItems(newItems);
                     }} />
                     <button onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-2 block">Memorial Descritivo / Observações Técnicas</label>
            <textarea className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold placeholder-gray-300" rows={5} value={technicalDesc} onChange={e => setTechnicalDesc(e.target.value)} placeholder="Descreva aqui o serviço, etapas de instalação e garantia..." />
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-2xl font-black text-vprom-dark">{formatCurrency(currentTotal)}</p>
            <button onClick={handleSave} className="bg-vprom-dark text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Salvar Proposta</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Visualização de Orçamento">
        {selectedQuote && (
          <div className="space-y-6 print:p-0">
            <div className="border-b pb-4">
               <h3 className="font-black text-vprom-dark uppercase text-xl">{clients.find(c => c.id === selectedQuote.clientId)?.name}</h3>
               <p className="text-xs text-gray-400 font-bold">EMISSÃO: {new Date(selectedQuote.date).toLocaleDateString()}</p>
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase text-vprom-orange mb-2">Memorial Descritivo</h4>
               <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-[2rem] border border-gray-100 whitespace-pre-wrap">
                  {selectedQuote.technicalDescription || 'Conforme projeto.'}
               </div>
            </div>
            <div className="bg-vprom-dark text-white p-6 rounded-[2rem] flex justify-between items-center">
               <span className="text-xs font-bold uppercase opacity-60">Valor Total do Serviço</span>
               <span className="text-2xl font-black">{formatCurrency(selectedQuote.total)}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t no-print">
               <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-vprom-dark px-6 py-4 rounded-2xl text-[10px] font-black uppercase"><Printer size={16}/> Imprimir Proposta</button>
               <button onClick={() => handleShareWhatsApp(selectedQuote)} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-green-100"><MessageCircle size={16}/> WhatsApp</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
