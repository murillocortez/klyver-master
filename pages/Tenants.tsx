import React, { useState } from 'react';
import { Search, Plus, MoreVertical, ShieldAlert, CheckCircle, Clock, Ban, Key, Wand2, X, Building2, User, Phone, Mail, CreditCard } from 'lucide-react';
import { MOCK_TENANTS, PLANS } from '../constants';
import { Tenant } from '../types';
import { Button } from '../components/Button';
import { analyzeTenantRisk } from '../services/geminiService';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleStatusChange = (id: string, newStatus: Tenant['status']) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTenant && selectedTenant.id === id) {
      setSelectedTenant(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAiAnalysis = async (tenant: Tenant) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await analyzeTenantRisk(tenant);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Simulate Backend Creation Logic
    const newId = (Math.random() * 10000).toFixed(0);
    const tenantIdCode = `FV-${(Math.random() * 9000 + 1000).toFixed(0)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const apiKey = `FV-KEY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const newTenant: Tenant = {
      id: newId,
      tenant_id: tenantIdCode,
      api_key: apiKey,
      fantasyName: formData.get('fantasyName') as string,
      corporateName: formData.get('corporateName') as string,
      cnpj: formData.get('cnpj') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      responsibleName: formData.get('responsibleName') as string,
      planId: formData.get('planId') as string,
      status: 'active', // Default to active
      createdAt: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
      lastActivity: new Date().toISOString(),
      monthlyRevenue: 0,
      activeUsers: 1,
      riskScore: 0,
    };

    setTenants([newTenant, ...tenants]);
    setIsCreateModalOpen(false);
    setSelectedTenant(newTenant); // Select the new tenant immediately
  };

  const filteredTenants = tenants.filter(t => 
    t.fantasyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenant_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Tenant['status']) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      blocked: "bg-red-100 text-red-700 border-red-200",
      suspended: "bg-slate-100 text-slate-700 border-slate-200"
    };
    
    const labels = {
      active: "Ativo",
      pending: "Pendente",
      blocked: "Bloqueado",
      suspended: "Suspenso"
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Farmácias (Tenants)</h2>
          <p className="text-slate-500">Gerencie todas as lojas cadastradas no SaaS.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Farmácia
        </Button>
      </div>

      {/* Main Content: List + Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, ID ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Farmácia</th>
                  <th className="px-6 py-3">Plano</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Renovação</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr 
                    key={tenant.id} 
                    onClick={() => { setSelectedTenant(tenant); setAiAnalysis(null); }}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedTenant?.id === tenant.id ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tenant.fantasyName}</div>
                      <div className="text-xs text-slate-500">{tenant.tenant_id}</div>
                    </td>
                    <td className="px-6 py-4">{PLANS.find(p => p.id === tenant.planId)?.name}</td>
                    <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                    <td className="px-6 py-4">
                      {new Date(tenant.nextBillingDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <MoreVertical className="w-5 h-5 text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-1">
          {selectedTenant ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedTenant.fantasyName}</h3>
                  <p className="text-sm text-slate-500">{selectedTenant.corporateName}</p>
                </div>
                {getStatusBadge(selectedTenant.status)}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ID:</span>
                    <span className="font-mono text-slate-700">{selectedTenant.tenant_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">CNPJ:</span>
                     <span>{selectedTenant.cnpj}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Resp:</span>
                     <span>{selectedTenant.responsibleName}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Credenciais API
                  </h4>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-md text-xs font-mono break-all relative group">
                    {selectedTenant.api_key}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-slate-700 px-2 py-1 rounded text-[10px] cursor-pointer">Copiar</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">Resetar Chave API</Button>
                </div>

                <div className="border-t border-slate-100 pt-4">
                   <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Controle de Acesso
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                     <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleStatusChange(selectedTenant.id, 'active')}
                        disabled={selectedTenant.status === 'active'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Ativar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleStatusChange(selectedTenant.id, 'blocked')}
                        disabled={selectedTenant.status === 'blocked'}
                      >
                        <Ban className="w-4 h-4 mr-1 text-red-600" /> Bloquear
                      </Button>
                  </div>
                </div>

                 <div className="border-t border-slate-100 pt-4">
                   <h4 className="font-semibold text-slate-900 mb-3 flex items-center text-purple-700">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Master AI Analysis
                  </h4>
                  {!aiAnalysis ? (
                    <Button 
                      onClick={() => handleAiAnalysis(selectedTenant)} 
                      isLoading={isAnalyzing}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Gerar Relatório de Risco
                    </Button>
                  ) : (
                    <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg text-sm text-slate-700">
                      <p className="mb-2 italic">"{aiAnalysis}"</p>
                      <button onClick={() => setAiAnalysis(null)} className="text-xs text-purple-600 font-bold hover:underline">Gerar Novamente</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <StoreIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>Selecione uma farmácia para ver detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TENANT MODAL */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm -m-6 p-6 fixed">
           {/* Note: -m-6 p-6 is to break out of padding if needed, or better use fixed positioning */}
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Cadastrar Nova Farmácia</h3>
                <p className="text-xs text-slate-500">Insira os dados da nova filial ou cliente SaaS.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTenant} className="overflow-y-auto p-6 space-y-6">
              
              {/* Section 1: Dados Empresariais */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-600 flex items-center uppercase tracking-wider">
                  <Building2 className="w-4 h-4 mr-2" /> Dados Empresariais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia <span className="text-red-500">*</span></label>
                    <input name="fantasyName" required type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Farmácia Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
                    <input name="corporateName" required type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Central Med LTDA" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ <span className="text-red-500">*</span></label>
                    <input name="cnpj" required type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="00.000.000/0001-00" />
                  </div>
                </div>
              </div>

              {/* Section 2: Contato e Responsável */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-emerald-600 flex items-center uppercase tracking-wider">
                  <User className="w-4 h-4 mr-2" /> Contato e Responsável
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável</label>
                    <input name="responsibleName" required type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="email" required type="email" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="contato@farmacia.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input name="phone" required type="text" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>
              </div>

               {/* Section 3: Plano e Assinatura */}
               <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-emerald-600 flex items-center uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 mr-2" /> Plano Inicial
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Plano Contratado</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLANS.map(plan => (
                      <label key={plan.id} className="cursor-pointer">
                        <input type="radio" name="planId" value={plan.id} className="peer sr-only" required />
                        <div className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:ring-1 peer-checked:ring-emerald-500 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700">{plan.name}</span>
                            <span className="text-sm font-semibold text-emerald-700">R$ {plan.priceMonthly}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Até {plan.maxClients} clientes • {plan.maxUsers} usuários</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Cadastrar Farmácia</Button>
              </div>
            </form>
           </div>
        </div>
      )}
    </div>
  );
};

const StoreIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
)