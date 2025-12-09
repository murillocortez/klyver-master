import React, { useState, useEffect } from 'react';
import { plugin } from 'postcss'; // Weird import, probably unused or error, I'll remove it.
import { Check, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Plan, planService } from '../../services/planService';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

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
    // For now, just a placeholder as UI for editing is complex
    // In a real scenario, this would open a modal with a form matching the plan structure
    const name = prompt("Nome do novo plano:");
    if (!name) return;

    const price = prompt("Preço mensal (ex: 99.90):");

    const newPlan = {
      name,
      code: name.toLowerCase().replace(/\s+/g, '-'),
      price_month: parseFloat(price || '0'),
      price_year: parseFloat(price || '0') * 10,
      limits: { users: 1, products: 100, orders: 50 },
      features: ['basic_support']
    };

    planService.create(newPlan).then(() => {
      loadPlans();
      alert('Plano criado com sucesso!');
    }).catch(err => {
      console.error(err);
      alert('Erro ao criar plano.');
    });
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

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando planos...</div>;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          // Safe parsing for features/limits in case they are confusing types from DB
          const features = (Array.isArray(plan.features) ? plan.features : []) as string[];
          const limits = typeof plan.limits === 'object' ? plan.limits : {} as any;

          return (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">R$ {plan.price_month}</span>
                  <span className="ml-1 text-slate-500">/mês</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">ou R$ {plan.price_year} /ano</p>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Limites</p>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Clientes</span>
                    {/* DB doesn't have maxClients explicitly, maybe orders/users? Showing Users/Orders */}
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Produtos</span>
                    <span className="font-semibold">{(limits as any).products === -1 ? 'Ilimitado' : (limits as any).products}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Usuários</span>
                    <span className="font-semibold">{(limits as any).users === -1 ? 'Ilimitado' : (limits as any).users}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700">Recursos (Exemplo)</p>
                  <div className="text-xs text-slate-500 italic">
                    {features.length > 0 ? features.join(', ') : 'Nenhum recurso listado'}
                  </div>
                  {/* 
                   Ideally we would map features to friendly names like the mock did.
                   For now, just listing raw codes or counting them.
                 */}
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                <Button variant="outline" className="w-full">
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Configuração
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};