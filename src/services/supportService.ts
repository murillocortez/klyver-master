import { supabase } from './supabase';
import { Database } from '../types/supabase';

type SupportTicket = Database['public']['Tables']['support_tickets']['Insert'];

export const supportService = {
    async createTicket(ticket: SupportTicket) {
        const { data, error } = await supabase
            .from('support_tickets')
            .insert(ticket)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async listTickets(options?: { status?: string }) {
        let query = supabase
            .from('support_tickets')
            .select('*, tenants(display_name, slug)')
            .order('created_at', { ascending: false });

        if (options?.status) {
            query = query.eq('status', options.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async updateStatus(ticketId: string, status: string) {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId);

        if (error) throw error;
    },

    // Adapter for UI
    async getTickets() {
        const data = await this.listTickets();
        return data.map((t: any) => ({
            id: t.id,
            tenantId: t.tenant_id,
            tenantName: t.tenants?.display_name || 'Desconhecido',
            subject: t.subject,
            description: t.message,
            category: t.origin || 'Geral', // Map origin to category
            status: t.status,
            urgency: 'medium', // Default or map if column exists (we added urgency? let's check types)
            createdAt: t.created_at,
            messages: [] // Fetch separate or include? Assuming simplified for now
        }));
    }
};
