import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];

export const billingService = {
    // Called when a payment is successfully completed (e.g., via webhook or success page)
    async processSuccessfulPayment(tenantId: string, planId: string, amount: number, method: string) {
        console.log(`[Billing] Processing successful payment for ${tenantId}`);

        // 1. Create Invoice Record (Paid)
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .insert({
                tenant_id: tenantId,
                plan_id: planId,
                amount: amount,
                status: 'paid',
                paid_at: new Date().toISOString(),
                due_date: new Date().toISOString(),
                currency: 'BRL'
            })
            .select()
            .single();

        if (invError) throw invError;

        // 2. Create Payment Record
        const { error: payError } = await supabase
            .from('payments')
            .insert({
                tenant_id: tenantId,
                invoice_id: invoice.id,
                amount: amount,
                method: method,
                status: 'confirmed',
                confirmed_at: new Date().toISOString()
            });

        if (payError) throw payError;

        // 3. Update Tenant Status & Dates
        // Calculate new period. Default 30 days.
        const now = new Date();
        const nextDue = new Date(now);
        nextDue.setDate(nextDue.getDate() + 30);

        const { error: tenantError } = await supabase
            .from('tenants')
            .update({
                status: 'active',
                last_payment_at: now.toISOString(),
                current_period_start: now.toISOString(),
                current_period_end: nextDue.toISOString(),
                next_payment_due_at: nextDue.toISOString(),
                blocked_reason: null
            })
            .eq('id', tenantId);

        if (tenantError) throw tenantError;

        return true;
    },

    async blockTenant(tenantId: string, reason: string) {
        await supabase
            .from('tenants')
            .update({
                status: 'blocked',
                blocked_reason: reason
            })
            .eq('id', tenantId);
    },

    async getHistory(tenantId: string) {
        const { data } = await supabase
            .from('invoices')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        return data || [];
    },

    async monitorSubscriptions() {
        // This would run daily
        const now = new Date().toISOString();

        // 1. Find active tenants past due date
        const { data: expiredTenants, error } = await supabase
            .from('tenants')
            .select('*')
            .in('status', ['active', 'trial'])
            .lt('next_payment_due_at', now);

        if (error) throw error;
        if (!expiredTenants) return;

        for (const tenant of expiredTenants) {
            const daysOverdue = (new Date(now).getTime() - new Date(tenant.next_payment_due_at!).getTime()) / (1000 * 3600 * 24);

            // Grace period of 3 days before full block, set to 'past_due' first?
            // For simplicity, let's just mark as 'past_due' immediately.
            // If more than 5 days, 'blocked'.

            let newStatus = 'past_due';
            if (daysOverdue > 5) newStatus = 'blocked';

            console.log(`[BillingMonitor] Updating ${tenant.slug} to ${newStatus}`);

            await supabase.from('tenants').update({
                status: newStatus,
                blocked_reason: newStatus === 'blocked' ? 'Pagamento atrasado há mais de 5 dias.' : 'Pagamento em atraso.'
            }).eq('id', tenant.id);
        }
    }
};
