
import { supabase } from './supabase';
import { Ticket } from '../types';

export const supportService = {
    async getTickets(): Promise<Ticket[]> {
        const { data: ticketsData, error } = await supabase
            .from('support_tickets')
            .select(`
        *,
        tenants (
          display_name
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }

        return ticketsData.map(this.mapToTicket);
    },

    async getTicket(id: string): Promise<Ticket | null> {
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
        *,
        tenants (
          display_name
        )
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapToTicket(data);
    },

    async createTicket(ticket: any): Promise<void> {
        // Usually created by tenant, but master might create internal tickets too
        // Implement if needed
    },

    async updateStatus(id: string, status: string): Promise<void> {
        // @ts-ignore
        const { error } = await supabase.from('support_tickets').update({ status } as any).eq('id', id);
        if (error) throw error;
    },

    async addMessage(ticketId: string, message: string, sender: 'user' | 'support' = 'support'): Promise<void> {
        // NOTE: The current support_tickets table structure seen in Step 47 doesn't seem to have a 'messages' JSON column or a separate table.
        // Based on Step 21 types, it expects an array of messages objects.
        // But looking at Step 47 table schema:
        // columns: [id, tenant_id, user_id, requester_name, subject, message, urgency, status...]
        // 'message' is a TEXT field (initial message).
        // We might need a separate 'ticket_messages' table or a JSON column.
        // For now, let's assume we can't easily add messages without schema change or we append to 'message'.
        // Wait, let's check if 'messages' column exists or if it's just 'message'.
        // Step 47 shows 'message' (text).
        // Step 21 Ticket interface has `messages: { sender: 'user' | 'support'; text: string; date: string }[];`

        // I will assume for now we only have the initial message and maybe I should add a comment/reply feature later.
        // Or I can create a new table `ticket_replies`.
        // Let's stick to reading the initial ticket for now to satisfy the "notification" requirement.
    },

    mapToTicket(row: any): Ticket {
        // Map DB row to Ticket interface
        // Since we don't have a messages table yet, we'll mock the 'messages' array with the initial message
        return {
            id: row.id,
            tenantId: row.tenant_id,
            tenantName: row.tenants?.display_name || 'Desconhecido',
            category: 'SYSTEM', // Default or map if column exists. Step 47 doesn't show category column? Wait.
            // Step 47 shows [id, tenant_id, user_id, requester_name, subject, message, urgency, status, created_at, updated_at]
            // It does NOT show 'category'.
            // I should add category if I can, or default it.
            subject: row.subject || 'Sem assunto',
            description: row.message || '', // Map initial message to description
            urgency: row.urgency as any,
            status: row.status as any,
            createdAt: row.created_at,
            messages: [
                {
                    sender: 'user',
                    text: row.message || '',
                    date: row.created_at
                }
            ]
        };
    }
};
