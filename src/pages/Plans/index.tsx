import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { Plan, planService } from '../../services/planService';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await planService.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      alert('Erro ao carregar planos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan({
      name: '',
      code: '',
      price_month: 0,
      price_year: 0,
      limits: { max_users: 5, max_products: 1000, max_tenants: 1 },
      features: []
    });
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({
      ...plan,
      // Ensure complex objects are editable format
      limits: plan.limits || { max_users: 5, max_products: 1000, max_tenants: 1 },
      features: plan.features || []
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setLoading(true);
      const startCode = editingPlan.code || editingPlan.name?.toLowerCase().replace(/\s+/g, '-') || 'plan-' + Math.random().toString(36).substr(2, 5);

      const planData: any = {
        name: editingPlan.name,
        code: startCode,
        price_month: Number(editingPlan.price_month),
        price_year: Number(editingPlan.price_year),
        limits: editingPlan.limits,
        features: Array.isArray(editingPlan.features) ? editingPlan.features : String(editingPlan.features).split('\n').map(s => s.trim()).filter(Boolean)
      };

      if ((editingPlan as any).id) {
        await planService.update((editingPlan as any).id, planData);
      } else {
        await planService.create(planData);
      }

      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar plano. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;
    try {
      await planService.delete(id);
      loadPlans();
    } catch (error) {
      alert('Erro ao excluir plano.');
    }
  };

  const handleFeatureChange = (text: string) => {
    // Split by new line for simple editing of array
    setEditingPlan(prev => ({ ...prev!, features: text.split('\n') }));
  };

  if (loading && !isModalOpen) return <div className="p-8 text-center text-slate-500">Carregando planos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Planos e Recursos</h2>
          <p className="text-slate-500">Configure os níveis de serviço oferecidos.</p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features = (Array.isArray(plan.features) ? plan.features : []) as string[];
          const limits = (plan.limits as any) || {};

          return (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEditPlan(plan)} className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 pr-12">{plan.name}</h3>
                <div className="text-xs font-mono text-slate-400 mb-4">{plan.code}</div>

                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">R$ {plan.price_month}</span>
                  <span className="ml-1 text-slate-500">/mês</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">R$ {plan.price_year} /ano</p>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limites</p>
                  <div className="flex justify-between text-sm text-slate-600 border-b border-slate-50 pb-1">
                    <span>Usuários</span>
                    <span className="font-semibold">{limits.max_users === 999 ? 'Ilimitado' : limits.max_users}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 border-b border-slate-50 pb-1">
                    <span>Produtos</span>
                    <span className="font-semibold">{limits.max_products === 999999 ? 'Ilimitado' : limits.max_products}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Lojas</span>
                    <span className="font-semibold">{limits.max_tenants || 1}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recursos</p>
                  <ul className="space-y-1.5">
                    {features.slice(0, 5).map((feat, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start">
                        <Check className="w-3 h-3 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                        {feat}
                      </li>
                    ))}
                    {features.length > 5 && (
                      <li className="text-xs text-slate-400 italic pl-5">+ {features.length - 5} outros</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* EDIT/CREATE MODAL */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-slate-900">
                {(editingPlan as any).id ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSavePlan} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nome do Plano</label>
                  <input
                    required
                    value={editingPlan.name || ''}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Código (Slug)</label>
                  <input
                    value={editingPlan.code || ''}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, code: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-600"
                    placeholder="Auto-gerado se vazio"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Preço Mensal (R$)</label>
                  <input
                    type="number" step="0.01"
                    value={editingPlan.price_month || 0}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, price_month: Number(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Preço Anual (R$)</label>
                  <input
                    type="number" step="0.01"
                    value={editingPlan.price_year || 0}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, price_year: Number(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Limites do Sistema</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Máx Usuários</label>
                    <input
                      type="number"
                      value={(editingPlan.limits as any)?.max_users || 0}
                      onChange={e => setEditingPlan(prev => ({
                        ...prev!,
                        limits: { ...(prev!.limits as any), max_users: Number(e.target.value) }
                      }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Máx Produtos</label>
                    <input
                      type="number"
                      value={(editingPlan.limits as any)?.max_products || 0}
                      onChange={e => setEditingPlan(prev => ({
                        ...prev!,
                        limits: { ...(prev!.limits as any), max_products: Number(e.target.value) }
                      }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Máx Lojas</label>
                    <input
                      type="number"
                      value={(editingPlan.limits as any)?.max_tenants || 1}
                      onChange={e => setEditingPlan(prev => ({
                        ...prev!,
                        limits: { ...(prev!.limits as any), max_tenants: Number(e.target.value) }
                      }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Use números altos (ex: 999999) para representar "Ilimitado".</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Lista de Recursos (Um por linha)</label>
                <textarea
                  rows={6}
                  value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : ''}
                  onChange={(e) => handleFeatureChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="Acesso ao App Mobile&#10;Suporte VIP&#10;Controle de Estoque"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Plano
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};