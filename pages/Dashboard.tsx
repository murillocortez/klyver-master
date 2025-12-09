import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { ANALYTICS_DATA, MOCK_TENANTS } from '../constants';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-full">+4.5%</span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-2">{subtext}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const activeTenants = MOCK_TENANTS.filter(t => t.status === 'active').length;
  const blockedTenants = MOCK_TENANTS.filter(t => t.status === 'blocked').length;
  const totalMRR = ANALYTICS_DATA[ANALYTICS_DATA.length - 1].mrr;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
        <p className="text-slate-500">Acompanhe os indicadores principais do MASTER.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="MRR Total" 
          value={`R$ ${totalMRR.toLocaleString('pt-BR')}`}
          subtext="Receita recorrente mensal"
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
          title="Risco de Cancelamento" 
          value="3"
          subtext="Farmácias com baixa atividade"
          icon={AlertTriangle}
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Crescimento de Receita (MRR)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={ANALYTICS_DATA} />
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Novas Farmácias vs Cancelamentos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="newTenants" name="Novas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Canceladas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AreaChartComponent = ({ data }: { data: any[] }) => {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
      <RechartsTooltip 
        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'MRR']}
      />
      <Line type="monotone" dataKey="mrr" stroke="#059669" strokeWidth={3} dot={{r: 4, fill: '#059669'}} activeDot={{r: 6}} />
    </LineChart>
  );
}