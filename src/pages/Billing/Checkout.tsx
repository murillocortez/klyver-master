import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase'; // Using the service wrapper instead of client directly usually, but we updated client.
import { supabase as supabaseClient } from '../../supabaseClient'; // Make sure we use the typed client
import { billingService } from '../../services/billingService';
import { CheckCircle, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/Button';

export const Checkout: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const planId = searchParams.get('planId');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // Data
    const [plan, setPlan] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        if (!tenantId || !planId) return;
        loadData();
    }, [tenantId, planId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: p } = await supabaseClient.from('store_plans').select('*').eq('id', planId!).single();
            const { data: t } = await supabaseClient.from('tenants').select('*').eq('id', tenantId!).single();
            setPlan(p);
            setTenant(t);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!tenantId || !planId || !plan) return;
        setProcessing(true);
        try {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 2000));

            await billingService.processSuccessfulPayment(tenantId, planId, plan.price_month, 'credit_card');
            setSuccess(true);
        } catch (e) {
            alert('Erro ao processar pagamento: ' + (e as any).message);
        } finally {
            setProcessing(false);
        }
    };

    const handleGoBack = () => {
        if (tenant?.admin_base_url) {
            window.location.href = tenant.admin_base_url;
        } else {
            // Fallback
            window.location.href = 'https://klyver-admin.vercel.app';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!tenantId || !planId || !plan || !tenant) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Inválido</h1>
                    <p className="text-slate-500">Não foi possível carregar os dados do pagamento.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Confirmado!</h2>
                    <p className="text-slate-500 mb-8">
                        A assinatura da farmácia <strong>{tenant.display_name}</strong> foi renovada com sucesso. O acesso foi liberado.
                    </p>
                    <Button onClick={handleGoBack} className="w-full">
                        Voltar para o Painel Administrativo
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center">
                    <h2 className="text-lg font-medium opacity-80">Renovação de Assinatura</h2>
                    <h1 className="text-2xl font-bold mt-1">{tenant.display_name}</h1>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                        <div>
                            <p className="text-sm text-slate-500">Plano Selecionado</p>
                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Valor</p>
                            <h3 className="text-xl font-bold text-emerald-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price_month)}
                                <span className="text-sm font-normal text-slate-400">/mês</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                        <div className="flex items-center mb-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
                            <span className="font-medium text-slate-900">Ambiente Seguro (Simulado)</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Este é um ambiente de teste. Nenhum valor real será cobrado do seu cartão.
                            Ao confirmar, o sistema irá gerar uma fatura paga e liberar o acesso automaticamente.
                        </p>
                    </div>

                    <Button
                        onClick={handlePayment}
                        className="w-full py-4 text-base"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 mr-2" />
                                Pagar Agora
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Pagamento processado via Klyver Billing
                    </p>
                </div>
            </div>
        </div>
    );
};
