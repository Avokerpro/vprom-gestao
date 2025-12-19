
import React, { useState, useMemo } from 'react';
import { Quote, Client, Product, Staff, TRANSLATIONS, QuoteStatus } from '../types';
import { Plus, Trash2, MessageCircle, Mail, Printer, Eye, FileText, CheckCircle2, XCircle, Clock, Send, Download } from 'lucide-react';
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

  const updateStatus = (quote: Quote, newStatus: QuoteStatus) => {
    onUpdateQuote({ ...quote, status: newStatus });
    if (selectedQuote?.id === quote.id) {
      setSelectedQuote({ ...quote, status: newStatus });
    }
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
      `Acesse a proposta detalhada para aprovação.\n` +
      `Ficamos à disposição para agendar o início dos trabalhos!`;
    
    const encoded = encodeURIComponent(text);
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
    
    if (quote.status === 'draft') updateStatus(quote, 'sent');
  };

  const handleShareEmail = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    if (!client || !client.email) {
        alert("Este cliente não possui e-mail cadastrado.");
        return;
    }
    const subject = encodeURIComponent("Proposta VPROM - Revestimentos Cimentícios");
    const body = encodeURIComponent(`Olá ${client.name},\n\nConforme solicitado, enviamos a proposta técnica no valor de ${formatCurrency(quote.total)}.\n\nDetalhes do serviço:\n${quote.technicalDescription}\n\nAtenciosamente,\nEquipe VPROM`);
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
    
    if (quote.status === 'draft') updateStatus(quote, 'sent');
  };

  const getStatusColor = (status: QuoteStatus) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'in_analysis': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sent': return 'bg-orange-100 text-vprom-orange border-orange-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
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
          const itemCount = Array.isArray(q.items) ? q.items.length : 0;
          return (
            <div key={q.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(q.status)}`}>
                    {TRANSLATIONS.quote_status[q.status] || q.status}
                  </span>
                  <h4 className="text-sm font-black text-vprom-dark uppercase">{client?.name || 'Cliente'}</h4>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(q.date).toLocaleDateString()} • {itemCount} {itemCount === 1 ? 'ITEM' : 'ITENS'}</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-lg font-black text-vprom-orange">{formatCurrency(q.total)}</p>
                <div className="flex gap-2">
                    <button onClick={() => { setSelectedQuote(q); setIsViewModalOpen(true); }} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-vprom-dark" title="Ver e Gerenciar Proposta"><Eye size={18}/></button>
                    <button onClick={() => handleShareWhatsApp(q)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="WhatsApp"><MessageCircle size={18}/></button>
                    <button onClick={() => handleShareEmail(q)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="E-mail"><Mail size={18}/></button>
                </div>
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
          <div className="space-y-6 print-container">
            {/* Controles de Status (Não aparecem na impressão) */}
            <div className="no-print bg-gray-50 p-4 rounded-2xl flex flex-wrap gap-2 items-center justify-between border border-gray-100">
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase text-gray-400">Status:</span>
                 <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(selectedQuote.status)}`}>
                    {TRANSLATIONS.quote_status[selectedQuote.status]}
                 </span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => updateStatus(selectedQuote, 'in_analysis')} className="p-2 bg-white text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all" title="Em Análise"><Clock size={16}/></button>
                  <button onClick={() => updateStatus(selectedQuote, 'approved')} className="p-2 bg-white text-green-600 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all" title="Aprovar"><CheckCircle2 size={16}/></button>
                  <button onClick={() => updateStatus(selectedQuote, 'rejected')} className="p-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all" title="Recusar"><XCircle size={16}/></button>
                  <button onClick={() => window.print()} className="p-2 bg-vprom-orange text-white rounded-xl shadow-md hover:scale-105 transition-all" title="Imprimir/PDF"><Printer size={16}/></button>
               </div>
            </div>

            {/* ÁREA DE IMPRESSÃO (Papel Timbrado Profissional) */}
            <div className="printable bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm print:border-0 print:shadow-none print:p-0">
               {/* Cabeçalho Proposta */}
               <div className="flex justify-between items-start mb-10 border-b-2 border-vprom-orange pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-vprom-dark tracking-tighter">VPROM</h1>
                    <p className="text-[10px] font-bold text-vprom-orange uppercase tracking-[0.2em]">Revestimentos Cimentícios</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black text-vprom-dark uppercase">Proposta Técnica</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">Nº {selectedQuote.id.slice(-6)}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase">{new Date(selectedQuote.date).toLocaleDateString()}</p>
                  </div>
               </div>

               {/* Dados do Cliente */}
               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase text-vprom-orange mb-3">Dados do Cliente</h3>
                    <p className="text-sm font-black text-vprom-dark uppercase">{clients.find(c => c.id === selectedQuote.clientId)?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{clients.find(c => c.id === selectedQuote.clientId)?.address}</p>
                    <p className="text-xs text-gray-600">{clients.find(c => c.id === selectedQuote.clientId)?.city} - {clients.find(c => c.id === selectedQuote.clientId)?.state}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <h3 className="text-[10px] font-black uppercase text-vprom-orange mb-3">Informações de Contato</h3>
                    <p className="text-xs text-gray-600 font-bold">Fone: {clients.find(c => c.id === selectedQuote.clientId)?.phone}</p>
                    <p className="text-xs text-gray-600 font-bold">Email: {clients.find(c => c.id === selectedQuote.clientId)?.email || 'Não informado'}</p>
                  </div>
               </div>

               {/* Itens do Orçamento */}
               <div className="mb-10">
                  <h3 className="text-[10px] font-black uppercase text-vprom-orange mb-4 px-2">Itens Inclusos na Proposta</h3>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400">Descrição</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qtd</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 text-right">Unitário</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(selectedQuote.items || []).map((item, i) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <tr key={i}>
                            <td className="py-4">
                              <p className="text-sm font-bold text-vprom-dark uppercase">{prod?.name}</p>
                              <p className="text-[8px] text-gray-400 font-black uppercase">{prod?.category}</p>
                            </td>
                            <td className="py-4 text-center text-sm font-black text-vprom-dark">{item.quantity} {prod?.unit}</td>
                            <td className="py-4 text-right text-sm text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-4 text-right text-sm font-black text-vprom-dark">{formatCurrency(item.quantity * item.unitPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                       <tr className="bg-vprom-dark text-white">
                         <td colSpan={3} className="p-6 rounded-l-[1.5rem] font-black uppercase text-xs">Total Estimado do Investimento</td>
                         <td className="p-6 text-right rounded-r-[1.5rem] font-black text-2xl text-vprom-orange">{formatCurrency(selectedQuote.total)}</td>
                       </tr>
                    </tfoot>
                  </table>
               </div>

               {/* Memorial Descritivo */}
               <div className="mb-16">
                  <h3 className="text-[10px] font-black uppercase text-vprom-orange mb-4 px-2">Memorial Técnico e Observações</h3>
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                    {selectedQuote.technicalDescription || 'Serviços de instalação conforme normas técnicas vigentes e manual do fabricante.'}
                  </div>
               </div>

               {/* ASSINATURAS (Visíveis apenas na impressão/PDF) */}
               <div className="grid grid-cols-2 gap-20 pt-10 border-t border-gray-100">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-300 mb-2 h-12 flex items-end justify-center">
                      <p className="text-[8px] text-gray-400 italic mb-2">Assinado digitalmente em {new Date().toLocaleDateString()}</p>
                    </div>
                    <p className="text-[10px] font-black uppercase text-vprom-dark">Responsável Técnico VPROM</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">CONTRATADA</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-300 mb-2 h-12"></div>
                    <p className="text-[10px] font-black uppercase text-vprom-dark">{clients.find(c => c.id === selectedQuote.clientId)?.name}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">CONTRATANTE / CLIENTE</p>
                  </div>
               </div>
            </div>

            {/* Ações Rápidas (WhatsApp/Email) */}
            <div className="no-print flex gap-3">
               <button onClick={() => handleShareWhatsApp(selectedQuote)} className="flex-1 flex items-center justify-center gap-3 bg-green-500 text-white py-5 rounded-[2rem] text-xs font-black uppercase shadow-lg shadow-green-100 active:scale-95 transition-all"><MessageCircle size={18}/> Enviar via WhatsApp</button>
               <button onClick={() => handleShareEmail(selectedQuote)} className="flex-1 flex items-center justify-center gap-3 bg-vprom-dark text-white py-5 rounded-[2rem] text-xs font-black uppercase shadow-lg shadow-gray-100 active:scale-95 transition-all"><Mail size={18}/> Enviar por E-mail</button>
            </div>
          </div>
        )}
      </Modal>
      
      <style>{`
        @media print {
          /* Esconde tudo exceto a área imprimível */
          body * { visibility: hidden !important; }
          .print-container, .print-container .printable, .print-container .printable * { 
            visibility: visible !important; 
          }
          .print-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: white;
            padding: 20px;
          }
          .no-print { display: none !important; }
          .Modal { background: white !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};
