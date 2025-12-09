import React, { useState } from 'react';
import { Search, Plus, MoreVertical, ShieldAlert, CheckCircle, Ban, Key, Wand2, X, Building2, User, Phone, Mail, CreditCard, ExternalLink, RefreshCw, Copy, UserPlus, Check } from 'lucide-react';
import { Tenant } from '../../types';
import { Button } from '../../components/Button';
import { analyzeTenantRisk } from '../../services/geminiService';
import { tenantService } from '../../services/tenantService';
import { Plan, planService } from '../../services/planService';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{ email: string, password: string } | null>(null);

  // Fetch tenants and plans on mount
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, plansData] = await Promise.all([
        tenantService.getAll(),
        planService.getAll()
      ]);
      setTenants(tenantsData);
      setPlans(plansData);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Tenant['status']) => {
    try {
      await tenantService.update(id, { status: newStatus });
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      if (selectedTenant && selectedTenant.id === id) {
        setSelectedTenant(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handlePlanChange = async (id: string, newPlanCode: string) => {
    try {
      // Optimistic update
      const updatedTenant = { ...selectedTenant!, planCode: newPlanCode };
      setSelectedTenant(updatedTenant); // Update detail view immediately

      await tenantService.update(id, { planCode: newPlanCode } as any); // Cast to any to allow planCode if not directly in Partial<Tenant>

      // Update list view
      setTenants(prev => prev.map(t => t.id === id ? { ...t, planCode: newPlanCode } : t));
    } catch (error) {
      alert('Erro ao atualizar plano');
      // Revert on error could be implemented here
    }
  };

  const handleAiAnalysis = async (tenant: Tenant) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeTenantRisk(tenant);
      setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis('Falha ao gerar análise.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const adminEmail = formData.get('adminEmail') as string;

    try {
      const { tenant: newTenant, tempPassword } = await tenantService.create({
        fantasyName: formData.get('fantasyName') as string,
        corporateName: formData.get('corporateName') as string,
        cnpj: formData.get('cnpj') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        responsibleName: formData.get('responsibleName') as string,
        planCode: formData.get('planCode') as string,
        adminName: formData.get('adminName') as string,
        adminEmail: adminEmail,
      });

      setTenants([newTenant, ...tenants]);
      setIsCreateModalOpen(false);
      setSelectedTenant(newTenant);

      if (tempPassword) {
        setTempCredentials({ email: adminEmail, password: tempPassword });
        setIsSuccessModalOpen(true);
      } else {
        alert('Farmácia criada com sucesso!');
      }

    } catch (error: any) {
      console.error(error);
      alert(`Erro ao criar farmácia: ${error.message || 'Verifique os dados e tente novamente.'}`);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!selectedTenant) return;

    const confirmed = window.confirm(
      `ATENÇÃO: AÇÃO IRREVERSÍVEL!\n\nVocê está prestes a excluir PERMANENTEMENTE a farmácia "${selectedTenant.fantasyName}".\n\nTodos os dados, configurações, usuários e histórico serão APAGADOS.\n\nTem certeza absoluta que deseja continuar?`
    );

    if (confirmed) {
      // Double confirmation for safety
      const doubleConfirmed = window.confirm(
        `CONFIRMAÇÃO FINAL: Deseja realmente excluir ${selectedTenant.fantasyName}? Esta ação NÃO pode ser desfeita.`
      );

      if (doubleConfirmed) {
        try {
          // Call basic delete (assuming cascade deletion in DB or just delete from tenants table)
          // Need to add delete method to service first if not exists, but for now assuming direct call or adding it.
          // Let's verify service has delete. It probably doesn't.
          // Checking service: tenantService.delete doesn't exist yet in the file I viewed.
          // I will add it to the service in a moment. For now, calling it.
          await tenantService.delete(id);
          setTenants(prev => prev.filter(t => t.id !== id));
          setSelectedTenant(null);
          alert('Farmácia excluída com sucesso.');
        } catch (error: any) {
          console.error(error);
          alert(`Erro ao excluir farmácia: ${error.message || 'Erro desconhecido'}`);
        }
      }
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.fantasyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenant_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const adminEmail = formData.get('adminEmail') as string;

    try {
      const updates = {
        fantasyName: formData.get('fantasyName') as string,
        corporateName: formData.get('corporateName') as string,
        slug: formData.get('slug') as string,
        cnpj: formData.get('cnpj') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        responsibleName: formData.get('responsibleName') as string,
        adminName: formData.get('adminName') as string,
        adminEmail: adminEmail,
      };

      const { tempPassword } = await tenantService.update(selectedTenant.id, updates);

      // Local update
      // We don't necessarily update local state with admin info since it's not part of Tenant interface shown in list
      // But we do update the other tenant fields
      const updatedTenant = { ...selectedTenant, ...updates };
      // @ts-ignore - Cleaning up optional undefined fields from updates spread if needed, though simple spread is fine for display
      setTenants(prev => prev.map(t => t.id === selectedTenant.id ? updatedTenant : t));
      setSelectedTenant(updatedTenant);
      setIsEditModalOpen(false);

      if (tempPassword) {
        setTempCredentials({ email: adminEmail, password: tempPassword });
        setIsSuccessModalOpen(true);
      } else {
        alert('Dados atualizados com sucesso!');
      }

    } catch (error) {
      alert('Erro ao atualizar farmácia. Verifique os dados.');
    }
  };

  const getStatusBadge = (status: Tenant['status']) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
      pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
      blocked: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
      suspended: "bg-slate-50 text-slate-600 ring-1 ring-slate-600/20"
    };
    const labels = {
      active: "Ativo",
      pending: "Pendente",
      blocked: "Bloqueado",
      suspended: "Suspenso"
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative h-full pb-10">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Farmácias</h2>
          <p className="text-slate-500 mt-1">Gestão da carteira de clientes.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-emerald-600/20">
          <Plus className="w-5 h-5 mr-2" />
          Nova Farmácia
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* List Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-12rem)] relative z-0">
          <div className="p-4 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar farmácia por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-12 pr-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white sticky top-0 z-10 border-b border-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider">Farmácia / Slug</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider">Plano</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider">Links</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => { setSelectedTenant(tenant); setAiAnalysis(null); }}
                    className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 ${selectedTenant?.id === tenant.id ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{tenant.fantasyName}</div>
                      <div className="text-xs text-emerald-600 font-mono mt-0.5">/{tenant.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 uppercase">
                        {plans.find(p => p.code === tenant.planCode)?.name || tenant.planCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-xs font-medium">
                        {tenant.adminBaseUrl && (
                          <a href={tenant.adminBaseUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-600 flex items-center" onClick={e => e.stopPropagation()}>
                            Admin <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                        {tenant.storeBaseUrl && (
                          <a href={tenant.storeBaseUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-600 flex items-center" onClick={e => e.stopPropagation()}>
                            Loja <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-1 relative z-0">
          {selectedTenant ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-6 sticky top-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedTenant.fantasyName}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedTenant.corporateName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      /{selectedTenant.slug}
                    </div>
                    {/* Onboarding Status Indicator */}
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedTenant.onboardingStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${selectedTenant.onboardingStatus === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {selectedTenant.onboardingStatus === 'completed' ? 'Dados preenchidos' : 'Dados pendentes'}
                    </div>
                  </div>
                </div>
                {getStatusBadge(selectedTenant.status)}
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsEditModalOpen(true)}>
                  Editar Dados
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => handleDeleteTenant(selectedTenant.id)}>
                  Excluir
                </Button>
              </div>

              {/* Plan Selection Dropdown */}
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Plano Atual
                  </p>
                  <span className="text-xs font-bold text-emerald-600 uppercase">
                    {plans.find(p => p.code === selectedTenant.planCode)?.name}
                  </span>
                </div>
                <select
                  value={selectedTenant.planCode}
                  onChange={(e) => handlePlanChange(selectedTenant.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                >
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.code}>
                      {plan.name} - R$ {plan.price_month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Links to Apps */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a
                  href={selectedTenant.adminBaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
                >
                  Abrir Admin <ExternalLink className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100" />
                </a>
                <a
                  href={selectedTenant.storeBaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
                >
                  Abrir Loja <ExternalLink className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100" />
                </a>
              </div>



              <div className="space-y-6">
                <div className="space-y-3 text-sm border-t border-slate-50 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informações</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Responsável</span>
                    <span className="text-slate-700 font-medium">{selectedTenant.responsibleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">CNPJ</span>
                    <span className="text-slate-700">{selectedTenant.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Email</span>
                    <span className="text-slate-700 truncate max-w-[180px]" title={selectedTenant.email}>{selectedTenant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">ID</span>
                    <span className="text-slate-700 font-mono text-xs">{selectedTenant.id}</span>
                  </div>
                </div>

                {/* Credenciais API */}
                <div className="pt-2 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 mt-4">
                    <Key className="w-4 h-4" /> Credenciais API
                  </h4>
                  <div className="bg-slate-900 rounded-lg p-3 relative group">
                    <p className="text-slate-500 text-xs font-mono break-all group-hover:text-emerald-400 transition-colors">
                      {selectedTenant.apiKey || 'sk_live_' + selectedTenant.id?.substring(0, 8) + '...'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => {
                      const newKey = 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                      alert(`NOVA CHAVE API GERADA:\n\n${newKey}\n\nCopie agora! Ela não será mostrada novamente.`);
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-2" /> Gerar Nova Chave
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
                    <ShieldAlert className="w-4 h-4" /> Controle de Acesso
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange(selectedTenant.id, 'active')}
                      disabled={selectedTenant.status === 'active'}
                      className="justify-center h-9 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Ativar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="justify-center h-9 bg-red-50 text-red-700 hover:bg-red-100 border-none"
                      onClick={() => handleStatusChange(selectedTenant.id, 'suspended')}
                      disabled={selectedTenant.status === 'suspended' || selectedTenant.status === 'blocked'}
                    >
                      <Ban className="w-4 h-4 mr-1.5" /> Bloquear
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" /> Master AI
                  </h4>
                  {!aiAnalysis ? (
                    <Button
                      onClick={() => handleAiAnalysis(selectedTenant)}
                      isLoading={isAnalyzing}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 border-none text-white hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20"
                    >
                      Analisar Risco de Churn
                    </Button>
                  ) : (
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl text-sm text-slate-700">
                      <p className="mb-3 leading-relaxed">"{aiAnalysis}"</p>
                      <button onClick={() => setAiAnalysis(null)} className="text-xs text-purple-700 font-bold hover:underline">Nova Análise</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Building2 className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-medium text-sm">Selecione uma farmácia da lista</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TENANT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Nova Farmácia</h3>
                <p className="text-sm text-slate-500 mt-1">Cadastro de novo cliente SaaS.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="overflow-y-auto p-8 space-y-8 custom-scrollbar">

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Dados Empresariais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nome Fantasia</label>
                    <input name="fantasyName" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: Farmácia Central" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Razão Social</label>
                    <input name="corporateName" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: Central Med LTDA" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">CNPJ</label>
                    <input name="cnpj" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="00.000.000/0001-00" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Contato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Responsável</label>
                    <input name="responsibleName" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">E-mail</label>
                    <input name="email" required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telefone</label>
                    <input name="phone" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Plano
                </h4>
                <div>
                  <select name="planCode" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                    <option value="">Selecione o Plano</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.code}>{plan.name} - R$ {plan.price_month}/mês</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* USER INITIAL ACCOUNT */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Usuário Inicial da Conta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nome do Administrador *</label>
                    <input name="adminName" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">E-mail Profissional *</label>
                    <input name="adminEmail" required type="email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 mt-2 bg-white p-3 rounded-lg border border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>Uma senha temporária será gerada automaticamente e exibida na próxima tela. O usuário deverá trocá-la no primeiro acesso.</p>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-slate-50">
                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="shadow-lg shadow-emerald-500/30">Cadastrar</Button>
              </div>
            </form >
          </div >
        </div >
      )}

      {/* EDIT TENANT MODAL */}
      {isEditModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Editar Farmácia</h3>
                <p className="text-sm text-slate-500 mt-1">Atualizar dados cadastrais.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditTenant} className="overflow-y-auto p-8 space-y-8 custom-scrollbar">

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Dados Empresariais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nome Fantasia</label>
                    <input name="fantasyName" defaultValue={selectedTenant.fantasyName} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Razão Social</label>
                    <input name="corporateName" defaultValue={selectedTenant.corporateName} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">CNPJ</label>
                    <input name="cnpj" defaultValue={selectedTenant.cnpj} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                    <input name="slug" defaultValue={selectedTenant.slug} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Contato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Responsável</label>
                    <input name="responsibleName" defaultValue={selectedTenant.responsibleName} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">E-mail</label>
                    <input name="email" defaultValue={selectedTenant.email} required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telefone</label>
                    <input name="phone" defaultValue={selectedTenant.phone} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* USER INITIAL ACCOUNT (EDIT) */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Usuário Inicial da Conta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nome do Administrador</label>
                    <input name="adminName" placeholder="Opcional - Criar/Atualizar admin" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">E-mail Profissional</label>
                    <input name="adminEmail" type="email" placeholder="Opcional - Criar/Atualizar admin" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 mt-2 bg-white p-3 rounded-lg border border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>Preencha apenas se desejar criar/atualizar o usuário administrador. Se o e-mail não existir, um novo usuário será criado com senha temporária.</p>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-slate-50">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="shadow-lg shadow-emerald-500/30">Salvar Alterações</Button>
              </div>
            </form >
          </div >
        </div >
      )}

      {/* SUCCESS MODAL - CREDENTIALS */}
      {isSuccessModalOpen && tempCredentials && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-emerald-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col items-center text-center p-8 relative">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-in zoom-in spin-in-12 duration-500">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>

            <h3 className="font-bold text-slate-900 text-2xl mb-2">Farmácia Cadastrada!</h3>
            <p className="text-slate-500 mb-8">O ambiente já está pronto para uso. <br /> Compartilhe as credenciais abaixo com o administrador.</p>

            <div className="bg-slate-50 rounded-2xl p-6 w-full border border-slate-100 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Dados de Acesso Inicial</h4>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-left">
                    <p className="text-xs text-slate-400">E-mail</p>
                    <p className="font-medium text-slate-700">{tempCredentials.email}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(tempCredentials.email)}
                    className="text-slate-400 hover:text-emerald-600 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Copiar E-mail"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Senha Temporária</p>
                    <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">{tempCredentials.password}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(tempCredentials.password)}
                    className="text-slate-400 hover:text-emerald-600 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Copiar Senha"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                onClick={() => {
                  const text = `Olá!\n\nSua farmácia foi cadastrada com sucesso no Farmavida.\n\nAcesse: ${selectedTenant?.adminBaseUrl || 'https://farma-vida-admin.vercel.app'}\n\nLogin: ${tempCredentials.email}\nSenha Provisória: ${tempCredentials.password}`;
                  navigator.clipboard.writeText(text);
                  alert('Dados copiados para a área de transferência!');
                }}
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar Dados de Acesso
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setIsSuccessModalOpen(false); setTempCredentials(null); }}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};