import React, { useState } from 'react';
import { Server, Play, Copy, CheckCircle, AlertTriangle, Shield, Clock, FileText } from 'lucide-react';
import { Button } from '../../components/Button';
import { MOCK_TENANTS } from '../../constants';
import { apiGetLicenseStatus, apiGetFeatures, apiGetPaymentsHistory, apiLogAccess } from '../../services/mockBackend';

type EndpointType = 'status' | 'features' | 'history' | 'log';

export const ApiIntegration: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointType>('status');
  const [tenantId, setTenantId] = useState('FV-1001-ABCD');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastStatus, setLastStatus] = useState<number | null>(null);

  const handleTestRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setLastStatus(null);
    
    try {
      let res;
      switch(activeEndpoint) {
        case 'status':
          res = await apiGetLicenseStatus(tenantId);
          break;
        case 'features':
          res = await apiGetFeatures(tenantId);
          break;
        case 'history':
          res = await apiGetPaymentsHistory(tenantId);
          break;
        case 'log':
          res = await apiLogAccess({
            tenant_id: tenantId,
            user_id: 'test_user_dev',
            origin: 'developer_console',
            timestamp: new Date().toISOString()
          });
          break;
      }
      setResponse(res);
      setLastStatus(res.status_code);
    } catch (error) {
      setResponse({ error: 'Network Error' });
      setLastStatus(500);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethod = () => activeEndpoint === 'log' ? 'POST' : 'GET';
  
  const getUrl = () => {
    const base = 'https://api.master-farmavida.com';
    switch(activeEndpoint) {
      case 'status': return `${base}/api/license-status?tenant_id=${tenantId}`;
      case 'features': return `${base}/api/features?tenant_id=${tenantId}`;
      case 'history': return `${base}/api/payments-history?tenant_id=${tenantId}`;
      case 'log': return `${base}/api/log-access`;
    }
  };

  const endpoints = [
    { id: 'status', label: 'License Status', method: 'GET', desc: 'Valida status da assinatura e bloqueio.' },
    { id: 'features', label: 'Features', method: 'GET', desc: 'Retorna módulos liberados pelo plano.' },
    { id: 'history', label: 'Payment History', method: 'GET', desc: 'Histórico financeiro do tenant.' },
    { id: 'log', label: 'Log Access', method: 'POST', desc: 'Registra acesso e audita origem.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Server className="w-6 h-6 mr-2 text-emerald-600" />
            API & Integração
          </h2>
          <p className="text-slate-500">Simulador de endpoints para integração com Admin e Loja.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        
        {/* Sidebar: Endpoint List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Endpoints Disponíveis</h3>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto">
            {endpoints.map(ep => (
              <button
                key={ep.id}
                onClick={() => { setActiveEndpoint(ep.id as any); setResponse(null); setLastStatus(null); }}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${activeEndpoint === ep.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {ep.method}
                  </span>
                  <span className="font-medium text-slate-800 text-sm">{ep.label}</span>
                </div>
                <p className="text-xs text-slate-500 ml-1">{ep.desc}</p>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
             <p>Use os IDs da tela de Farmácias para testar casos reais (ex: FV-1003-PEND para pendente).</p>
          </div>
        </div>

        {/* Main Area: Request & Response */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Request Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center space-x-4 mb-4">
                <div className={`px-3 py-1 rounded font-mono font-bold text-sm ${getMethod() === 'GET' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                  {getMethod()}
                </div>
                <div className="flex-1 bg-slate-100 p-2 rounded text-slate-600 font-mono text-sm truncate">
                  {getUrl()}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tenant ID</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     value={tenantId} 
                     onChange={(e) => setTenantId(e.target.value)}
                     className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                   />
                   <div className="absolute right-2 top-2">
                     <Shield className="w-4 h-4 text-slate-300" />
                   </div>
                 </div>
               </div>
               
               {activeEndpoint === 'log' && (
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Body (Simulado)</label>
                    <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 truncate">
                      {`{ "user_id": "test", "origin": "dev" }`}
                    </div>
                 </div>
               )}
             </div>

             <div className="flex justify-between items-center">
               <div className="text-xs text-slate-500 flex items-center">
                 <Copy className="w-3 h-3 mr-1" />
                 Copiar cURL
               </div>
               <Button onClick={handleTestRequest} isLoading={isLoading}>
                 <Play className="w-4 h-4 mr-2" />
                 Enviar Requisição
               </Button>
             </div>
          </div>

          {/* Response Output */}
          <div className="flex-1 bg-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-700">
            <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
              <span className="text-slate-300 text-xs font-mono">Response Body</span>
              {lastStatus && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${lastStatus === 200 || lastStatus === 201 ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                  Status: {lastStatus}
                </span>
              )}
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {response ? (
                <pre className="font-mono text-xs text-green-400 leading-relaxed">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Server className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Aguardando requisição...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};