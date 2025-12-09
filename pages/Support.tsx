import React, { useState } from 'react';
import { MOCK_TICKETS, MOCK_FAQS, MOCK_TENANTS } from '../constants';
import { Button } from '../components/Button';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Plus, Book, ChevronDown, ChevronRight, Paperclip, X } from 'lucide-react';
import { Ticket } from '../types';

export const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  
  // Ticket State
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // FAQ State
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const getUrgencyColor = (urgency: Ticket['urgency']) => {
    switch(urgency) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'answered': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredFaqs = MOCK_FAQS.filter(f => 
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const categories = Array.from(new Set(filteredFaqs.map(f => f.category)));

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add ticket would go here
    setIsNewTicketOpen(false);
    alert("Ticket criado com sucesso! (Simulação)");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
         <div>
          <h2 className="text-2xl font-bold text-slate-900">Central de Suporte</h2>
          <p className="text-slate-500">Gerencie atendimentos e base de conhecimento.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
             <button 
               onClick={() => setActiveTab('tickets')}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'tickets' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:text-slate-900'}`}
             >
               Tickets
             </button>
             <button 
               onClick={() => setActiveTab('faq')}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'faq' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:text-slate-900'}`}
             >
               FAQ / Ajuda
             </button>
          </div>
          <Button onClick={() => setIsNewTicketOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* TICKETS VIEW */}
      {activeTab === 'tickets' && (
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Ticket List */}
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicketId === ticket.id ? 'bg-slate-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getUrgencyColor(ticket.urgency)}`}>
                      {ticket.urgency}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">{ticket.subject}</h4>
                  <p className="text-xs text-slate-500 mb-2">{ticket.tenantName}</p>
                  <div className="flex items-center text-xs text-slate-500 space-x-2">
                     {getStatusIcon(ticket.status)}
                     <span className="capitalize">{ticket.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                     <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                      <p className="text-sm text-emerald-600 font-medium">{selectedTicket.tenantName}</p>
                     </div>
                     <Button variant="outline" size="sm">Fechar Ticket</Button>
                  </div>
                  <div className="flex space-x-4 mt-4 text-sm text-slate-500">
                    <span>Categoria: <b>{selectedTicket.category}</b></span>
                    <span>ID: {selectedTicket.id}</span>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
                   {/* Original Description */}
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                     <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Descrição Inicial</p>
                     <p className="text-slate-800">{selectedTicket.description}</p>
                   </div>

                   {/* Messages */}
                   {selectedTicket.messages.map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-lg p-4 ${msg.sender === 'support' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-2 text-right ${msg.sender === 'support' ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                     </div>
                   ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-200">
                  <textarea 
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Escreva uma resposta para a farmácia..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <Button>Enviar Resposta</Button>
                  </div>
                </div>
              </>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>Selecione um ticket para visualizar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ VIEW */}
      {activeTab === 'faq' && (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Book className="w-5 h-5 mr-2 text-emerald-600" /> 
              Base de Conhecimento
            </h3>
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Pesquisar por dúvida ou categoria..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {categories.map(category => {
              const items = filteredFaqs.filter(f => f.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="mb-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">{category}</h4>
                  <div className="space-y-3">
                    {items.map(faq => (
                      <div key={faq.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                          className="w-full flex justify-between items-center p-4 bg-white hover:bg-slate-50 text-left transition-colors"
                        >
                          <span className="font-medium text-slate-800">{faq.question}</span>
                          {openFaqId === faq.id ? <ChevronDown className="w-5 h-5 text-emerald-600" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {openFaqId === faq.id && (
                          <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-600 text-sm leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma resposta encontrada para sua busca.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isNewTicketOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Novo Ticket de Suporte</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Farmácia</label>
                <select className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Selecione a Farmácia...</option>
                  {MOCK_TENANTS.map(t => (
                    <option key={t.id} value={t.id}>{t.fantasyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria do Problema</label>
                <select className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Sistema da loja</option>
                  <option>Sistema administrativo</option>
                  <option>Integração de impressora</option>
                  <option>Configurações fiscais</option>
                  <option>CRM e cashback</option>
                  <option>API WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
                <input type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Resumo curto do problema" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Urgência</label>
                  <select className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Anexos</label>
                   <div className="border border-slate-300 border-dashed rounded-lg px-3 py-1.5 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                      <Paperclip className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-xs text-slate-500">Adicionar arquivo</span>
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea rows={4} className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Descreva o problema em detalhes..."></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsNewTicketOpen(false)}>Cancelar</Button>
                <Button type="submit">Criar Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};