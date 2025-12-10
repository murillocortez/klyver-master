import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { ANALYTICS_DATA, MOCK_TENANTS } from '../../constants';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> +4.5%
      </span>
      <p className="text-xs text-slate-400 font-medium">{subtext}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const activeTenants = MOCK_TENANTS.filter(t => t.status === 'active').length;
  const blockedTenants = MOCK_TENANTS.filter(t => t.status === 'blocked').length;
  const totalMRR = ANALYTICS_DATA[ANALYTICS_DATA.length - 1].mrr;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500">Visão geral da operação e métricas de desempenho.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="MRR Total"
          value={`R$ ${totalMRR.toLocaleString('pt-BR')}`}
          subtext="Receita mensal"
          icon={DollarSign}
          colorClass="bg-emerald-600 text-emerald-600"
        />
        <StatCard
          title="Farmácias Ativas"
          value={activeTenants}
          subtext={`${blockedTenants} bloqueadas`}
          icon={Users}
          colorClass="bg-blue-600 text-blue-600"
        />
        <StatCard
          title="Churn Rate"
          value="1.2%"
          subtext="Últimos 30 dias"
          icon={TrendingUp}
          colorClass="bg-purple-600 text-purple-600"
        />
        <StatCard
          title="Em Risco"
          value="3"
          subtext="Baixo engajamento"
          icon={AlertTriangle}
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Evolução do MRR</h3>
              <p className="text-sm text-slate-400">Receita recorrente semestral</p>
            </div>
            <div className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">Últimos 6 meses</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={ANALYTICS_DATA} />
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Aquisição vs Churn</h3>
              <p className="text-sm text-slate-400">Entradas e saídas de clientes</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Novas</span>
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div> Churn</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA} barSize={24} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '12px' }}
                />
                <Bar dataKey="newTenants" name="Novas" fill="#10b981" radius={[4, 4, 4, 4]} />
                <Bar dataKey="churned" name="Canceladas" fill="#ef4444" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DEV TOOLS */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white opacity-50 hover:opacity-100 transition-opacity">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Dev Tools</h3>
        <p className="text-xs mb-4">Ferramentas para simular estados do sistema.</p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              // This is a rough simulation, ideally use an API.
              // Since we are in Master, we can import billingService!
              try {
                const { billingService } = await import('../../services/billingService');
                const { supabase } = await import('../../supabaseClient');
                const { data } = await supabase.from('tenants').select('id').eq('slug', 'farma-vida').single(); // Adjust slug if different
                if (data) {
                  // @ts-ignore
                  await billingService.blockTenant(data.id, 'Simulação de Pagamento Atrasado');
                  alert('Farmácia bloqueada com sucesso! Teste no Admin/Loja.');
                } else {
                  alert('Tenant de teste não encontrado.');
                }
              } catch (e) { console.error(e); alert('Erro ao bloquear'); }
            }}
            className="px-3 py-2 bg-red-600 rounded text-xs font-bold hover:bg-red-700"
          >
            Simular Bloqueio (farma-vida)
          </button>

          <button
            onClick={async () => {
              try {
                const { billingService } = await import('../../services/billingService');
                const { supabase } = await import('../../supabaseClient');
                const { data } = await supabase.from('tenants').select('id').eq('slug', 'farma-vida').single();
                if (data) {
                  // Manually unblock
                  // @ts-ignore
                  await supabase.from('tenants').update({ status: 'active', blocked_reason: null }).eq('id', data.id);
                  alert('Farmácia desbloqueada!');
                }
              } catch (e) { console.error(e); alert('Erro ao desbloquear'); }
            }}
            className="px-3 py-2 bg-emerald-600 rounded text-xs font-bold hover:bg-emerald-700"
          >
            Desbloquear (farma-vida)
          </button>
        </div>
      </div>
    </div>
  );
};

const AreaChartComponent = ({ data }: { data: any[] }) => {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
      <RechartsTooltip
        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '12px' }}
        formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'MRR']}
      />
      <Line
        type="monotone"
        dataKey="mrr"
        stroke="#059669"
        strokeWidth={3}
        dot={false}
        activeDot={{ r: 6, fill: '#059669', strokeWidth: 0, stroke: '#fff' }}
      />
    </LineChart>
  );
}