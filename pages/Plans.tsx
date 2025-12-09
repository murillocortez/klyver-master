import React from 'react';
import { Check, X } from 'lucide-react';
import { PLANS } from '../constants';
import { Button } from '../components/Button';

export const Plans: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Planos e Recursos</h2>
          <p className="text-slate-500">Configure os níveis de serviço oferecidos.</p>
        </div>
        <Button>Criar Novo Plano</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900">R$ {plan.priceMonthly}</span>
                <span className="ml-1 text-slate-500">/mês</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">ou R$ {plan.priceYearly} /ano</p>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Limites</p>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Clientes</span>
                  <span className="font-semibold">{plan.maxClients.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Usuários</span>
                  <span className="font-semibold">{plan.maxUsers}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700">Módulos</p>
                {Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    {value ? (
                      <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mr-2 flex-shrink-0" />
                    )}
                    <span className={`capitalize ${value ? 'text-slate-700' : 'text-slate-400'}`}>
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 pt-0 mt-auto">
              <Button variant="outline" className="w-full">Editar Configuração</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};