
import React, { useState, useEffect } from 'react';
import {
  Search, Plus, MessageSquare, AlertCircle, FileText, CheckCircle,
  ChevronRight, Paperclip, Send, Clock, HelpCircle,
  CreditCard, LayoutDashboard, Printer, Users, MessageCircle, Store, X
} from 'lucide-react';
import { supportService, EnhancedTicket } from '../../services/supportService';
import { aiService, faqService } from '../../services/aiService';

// --- COMPONENTS ---

const StatusBadge = ({ status, urgency }: { status: string, urgency?: string }) => {
  const statusColors: any = {
    'open': 'bg-blue-100 text-blue-700',
    'in_progress': 'bg-yellow-100 text-yellow-700',
    'resolved': 'bg-green-100 text-green-700',
    'closed': 'bg-gray-100 text-gray-600',
    'pending_client': 'bg-purple-100 text-purple-700'
  };

  // Urgency dot
  const urgencyColor = urgency === 'alta' ? 'bg-red-500' : urgency === 'media' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${statusColors[status] || 'bg-gray-100'}`}>
      <span className={`w-2 h-2 rounded-full ${urgencyColor}`} />
      {status.replace('_', ' ')}
    </div>
  );
};

// --- FAQ SECTION ---
const FAQSection = ({ onSelectArticle }: any) => {
  const [query, setQuery] = useState('');
  const results = faqService.search(query);
  const displayItems = query ? results : faqService.kbArticles.slice(0, 4); // Show top articles if no query

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center py-10 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <h2 className="text-3xl font-bold mb-4 relative z-10">Como podemos ajudar hoje?</h2>
        <div className="max-w-xl mx-auto relative z-10 px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white/20 outline-none backdrop-blur-sm transition-all"
              placeholder="Busque por 'erro fiscal', 'impressora'..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!query && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {faqService.categories.map((cat: any) => {
            const iconMap: any = {
              'Store': Store,
              'LayoutDashboard': LayoutDashboard,
              'FileText': FileText,
              'Printer': Printer,
              'Users': Users,
              'MessageCircle': MessageCircle,
              'HelpCircle': HelpCircle, // Fallback
              'Bot': MessageSquare, // AI
              'CreditCard': CreditCard
            };
            const Icon = iconMap[cat.icon] || HelpCircle;

            return (
              <div key={cat.id} className="p-6 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer bg-white group">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl w-fit mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-slate-900">{cat.title}</h3>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            {query ? 'Resultados da busca' : 'Artigos Recomendados'}
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {displayItems.length > 0 ? displayItems.map((article: any) => (
            <div key={article.id} onClick={() => onSelectArticle(article)} className="p-6 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group">
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{article.title}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{article.content}</p>
                <div className="flex gap-2 mt-3">
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md">#{tag}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-emerald-500" />
            </div>
          )) : (
            <div className="p-10 text-center text-slate-400">
              Nenhum artigo encontrado para sua busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- NEW TICKET FORM ---
const NewTicketForm = ({ onClose, onSuccess, userEmail, userName }: any) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Geral');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter(f => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type);
        const isValidSize = f.size <= 2 * 1024 * 1024; // 2MB
        if (!isValidType) alert(`Arquivo ${f.name} inválido. Apenas JPG, PNG, PDF.`);
        if (!isValidSize) alert(`Arquivo ${f.name} muito grande. Máx 2MB.`);
        return isValidType && isValidSize;
      });

      if (files.length + validFiles.length > 10) {
        alert('Máximo de 10 arquivos permitidos.');
        return;
      }
      setFiles([...files, ...validFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supportService.createTicket({
        subject,
        description,
        category,
        files,
        tenantId: 'current-tenant-id-mock', // In real app useAuth().tenantId
        contactEmail: userEmail || 'user@example.com',
        contactName: userName || 'User',
        tenantName: 'Minha Farmácia'
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-10 max-w-2xl w-full mx-auto">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Novo Chamado</h2>
          <p className="text-sm text-slate-500">Descreva seu problema detalhadamente para análise da IA.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {faqService.categories.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Assunto</label>
          <input
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex: Erro ao emitir Nota Fiscal"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Descrição Detalhada</label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Descreva o que aconteceu, passos para reproduzir, mensagens de erro..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Anexos (Opcional)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Paperclip className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Arraste arquivos ou clique para selecionar</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF até 2MB</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={16} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{f.name}</span>
                </div>
                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X size={16} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-70 flex items-center gap-2">
            {submitting ? 'Enviando e Analisando...' : 'Abrir Chamado'}
            {!submitting && <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- TICKET LIST ---
const TicketList = ({ onSelectTicket }: any) => {
  const [tickets, setTickets] = useState<EnhancedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await supportService.listTickets();
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando chamados...</div>;

  if (tickets.length === 0) return (
    <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-300">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
        <MessageSquare size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Sem chamados recentes</h3>
      <p className="text-slate-500 mt-2">Você ainda não abriu nenhum chamado de suporte.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="divide-y divide-slate-100">
        {tickets.map(ticket => (
          <div key={ticket.id} onClick={() => onSelectTicket(ticket)} className="p-6 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${ticket.urgency === 'alta' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">ID: #{ticket.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <StatusBadge status={ticket.status} urgency={ticket.urgency} />
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TICKET DETAIL ---
const TicketDetail = ({ ticket, onBack }: { ticket: EnhancedTicket, onBack: () => void }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4">
      {/* Left Column: Messages */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center gap-1">
                <ChevronRight size={16} className="rotate-180" /> Voltar
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Ticket #{ticket.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{ticket.subject}</h1>
            <p className="text-slate-600">{ticket.description}</p>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4 flex gap-2">
                {ticket.attachments.map((att, i) => (
                  <a key={i} href={att.url} target="_blank" rel="noopener" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100">
                    <Paperclip size={14} /> {att.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          <StatusBadge status={ticket.status} urgency={ticket.urgency} />
        </div>

        {/* Chat Area Mock */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
          <div className="flex-1 p-6 space-y-6">
            <div className="flex justify-center">
              <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className="text-sm text-slate-800">Olá! Recebemos seu chamado. A IA identificou urgência {ticket.urgency.toUpperCase()}. Um atendente analisará em breve.</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <div className="flex gap-2">
              <input className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none" placeholder="Digite uma resposta..." />
              <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Analysis */}
      <div className="space-y-6">
        {ticket.aiAnalysis && (
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Análise Inteligente
            </h3>

            <div className="space-y-4">
              <div className="bg-white/50 rounded-xl p-3 border border-indigo-50">
                <div className="text-xs text-indigo-400 font-bold uppercase mb-1">Categoria Detectada</div>
                <div className="text-indigo-900 font-bold">{ticket.aiAnalysis.category}</div>
              </div>

              <div className="bg-white/50 rounded-xl p-3 border border-indigo-50">
                <div className="text-xs text-indigo-400 font-bold uppercase mb-1">Probabilidade de Erro</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${ticket.aiAnalysis.riskAssessment.technicalErrorProbability}%` }} />
                  </div>
                  <span className="text-xs font-bold text-indigo-700">{ticket.aiAnalysis.riskAssessment.technicalErrorProbability}% Técnico</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                <h4 className="font-bold text-indigo-900 text-sm mb-2">Recomendações Sugeridas:</h4>
                <ul className="space-y-2">
                  {ticket.aiAnalysis.recommendedActions.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-indigo-700 flex items-start gap-2">
                      <CheckCircle size={12} className="mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                  {ticket.aiAnalysis.recommendedActions.length === 0 && <li className="text-xs text-indigo-400">Nenhuma recomendação automática.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detalhes do Contrato</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Plano</span>
            <span className="text-sm font-bold text-slate-900">PRO</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Status</span>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">ATIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function SupportPage() {
  const [view, setView] = useState<'home' | 'create' | 'detail'>('home');
  const [selectedTicket, setSelectedTicket] = useState<EnhancedTicket | null>(null);

  const handleCreateSuccess = () => {
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="text-emerald-500" />
            Central de Ajuda
          </h1>
          {view === 'home' && (
            <nav className="flex items-center gap-6">
              <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Base de Conhecimento</button>
              <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Meus Chamados</button>
            </nav>
          )}
          {view === 'home' && (
            <button
              onClick={() => setView('create')}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Plus size={16} />
              Novo Chamado
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'home' && (
          <div className="space-y-12">
            <FAQSection onSelectArticle={() => { }} />
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Meus Chamados Recentes</h2>
              </div>
              <TicketList onSelectTicket={(t: EnhancedTicket) => { setSelectedTicket(t); setView('detail'); }} />
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="flex justify-center">
            <NewTicketForm onClose={() => setView('home')} onSuccess={handleCreateSuccess} />
          </div>
        )}

        {view === 'detail' && selectedTicket && (
          <TicketDetail ticket={selectedTicket} onBack={() => setView('home')} />
        )}
      </main>
    </div>
  );
}