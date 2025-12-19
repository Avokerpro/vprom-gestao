
import React, { useState, useMemo } from 'react';
import { Quote, Client, Product, Staff, TRANSLATIONS } from '../types';
import { Plus, Trash2, MessageCircle, Mail, Printer, Eye, Share2, FileText, CheckCircle2 } from 'lucide-react';
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
    
    const text = `*PROPOSTA TÉCNICA - VPROM REVESTIMENTOS*\n\n` +
      `Olá ${client.name},\n` +
      `Seguem os detalhes do seu orçamento para revestimento cimentício:\n\n` +
      `*MEMORIAL DESCRITIVO:*\n${quote.technicalDescription || 'Conforme projeto executivo.'}\n\n` +
      `*VALOR TOTAL:* ${formatCurrency(quote.total)}\n\n` +
      `Ficamos à disposição para agendar o início dos trabalhos!`;
    
    const encoded = encodeURIComponent(text);
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
  };

  const handleShareEmail = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    if (!client || !client.email) {
        alert("Este cliente não possui e-mail cadastrado.");
        return;
    }
    const subject = encodeURIComponent("Proposta VPROM - Revestimentos Cimentícios");
    const body = encodeURIComponent(`Olá ${client.name},\n\nConforme solicitado, enviamos a proposta técnica no valor de ${formatCurrency(quote.total)}.\n\nDetalhes do serviço:\n${quote.technicalDescription}`);
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-vprom-dark tracking-tighter">Propostas</h2>
          <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-widest">Orçamentos & Gestão Técnica</p>
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
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${q.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {TRANSLATIONS.quote_status[q.status as keyof typeof TRANSLATIONS.quote_status] || q.status}
                  </span>
                  <h4 className="text-sm font-black text-vprom-dark uppercase">{client?.name || 'Cliente'}</h4>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(q.date).toLocaleDateString()} • {formatCurrency(q.total)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedQuote(q); setIsViewModalOpen(true); }} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-vprom-dark" title="Ver Proposta"><Eye size={18}/></button>
                <button onClick={() => handleShareWhatsApp(q)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="WhatsApp"><MessageCircle size={18}/></button>
                <button onClick={() => handleShareEmail(q)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="E-mail"><Mail size={18}/></button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Proposta Técnica">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-2 tracking-widest">Cliente</label>
            <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-vprom-orange" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">Selecione o cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.city}</option>)}
            </select>
          </div>

          <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Itens do Orçamento</h5>
            <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold mb-4 outline-none" onChange={e => { if(e.target.value) { setSelectedItems([...selectedItems, {productId: e.target.value, qty: 1}]); e.target.value = ''; } }}>
              <option value="">Adicionar Material ou Serviço...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>)}
            </select>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-800">{products.find(p => p.id === item.productId)?.name}</span>
                    <p className="text-[8px] font-black uppercase text-gray-400">{products.find(p => p.id === item.productId)?.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" className="w-16 p-2 text-center bg-gray-50 border rounded-xl text-xs font-black" value={item.qty} onChange={e => {
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
            <label className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-2 block tracking-widest">Memorial Descritivo / Observações Técnicas</label>
            <textarea 
                className="w-full p-5 bg-white border border-gray-200 rounded-[2rem] text-sm font-bold placeholder-gray-300 outline-none focus:border-vprom-orange shadow-sm" 
                rows={6} 
                value={technicalDesc} 
                onChange={e => setTechnicalDesc(e.target.value)}
                placeholder="Ex: Instalação de chapas de 8mm em fachada lateral, tratamento de juntas com tela, 2 demãos de impermeabilizante..."
            />
          </div>

          <div className="flex justify-between items-center bg-vprom-dark text-white p-8 rounded-[2.5rem] shadow-xl">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total da Proposta</p>
                <p className="text-3xl font-black text-vprom-orange">{formatCurrency(currentTotal)}</p>
            </div>
            <button onClick={handleSave} className="bg-white text-vprom-dark px-8 py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-vprom-orange hover:text-white transition-all active:scale-95 shadow-lg">Finalizar e Salvar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhamento da Proposta">
        {selectedQuote && (
          <div className="space-y-6 print:p-0">
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
               <div>
                  <h3 className="font-black text-vprom-dark uppercase text-2xl tracking-tighter">{clients.find(c => c.id === selectedQuote.clientId)?.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cidade: {clients.find(c => c.id === selectedQuote.clientId)?.city}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-400 font-black uppercase">Data de Emissão</p>
                  <p className="text-sm font-black text-vprom-dark">{new Date(selectedQuote.date).toLocaleDateString()}</p>
               </div>
            </div>
            
            <div>
               <h4 className="text-[10px] font-black uppercase text-vprom-orange mb-4 tracking-widest flex items-center gap-2"><FileText size={14}/> Memorial Técnico de Execução</h4>
               <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap shadow-inner">
                  {selectedQuote.technicalDescription || 'Nenhum memorial técnico cadastrado.'}
               </div>
            </div>

            <div className="bg-vprom-dark text-white p-8 rounded-[2.5rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><CheckCircle2 size={100} /></div>
               <div>
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2 block">Investimento Total Estimado</span>
                  <span className="text-4xl font-black text-vprom-orange">{formatCurrency(selectedQuote.total)}</span>
               </div>
               <div className="no-print">
                   <button onClick={() => window.print()} className="bg-vprom-orange text-white p-4 rounded-2xl hover:bg-white hover:text-vprom-dark transition-all"><Printer size={24}/></button>
               </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100 no-print">
               <button onClick={() => handleShareWhatsApp(selectedQuote)} className="flex-1 flex items-center justify-center gap-3 bg-green-500 text-white py-5 rounded-[2rem] text-xs font-black uppercase shadow-lg shadow-green-100 active:scale-95 transition-all"><MessageCircle size={18}/> Enviar via WhatsApp</button>
               <button onClick={() => handleShareEmail(selectedQuote)} className="flex-1 flex items-center justify-center gap-3 bg-vprom-dark text-white py-5 rounded-[2rem] text-xs font-black uppercase shadow-lg shadow-gray-100 active:scale-95 transition-all"><Mail size={18}/> Enviar por E-mail</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
