import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { aiService } from './aiService';

type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert'];

export interface TicketAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface EnhancedTicket {
    id: string;
    tenantId: string;
    tenantName: string;
    subject: string;
    description: string;
    category: string;
    status: string;
    urgency: 'alta' | 'media' | 'baixa';
    createdAt: string;
    aiAnalysis: any;
    attachments: TicketAttachment[];
    messages: any[];
}

export const supportService = {
    async createTicket(data: {
        subject: string;
        description: string;
        category: string;
        files: File[];
        tenantId: string;
        contactName: string;
        contactEmail: string;
        tenantName: string;
    }) {
        // 1. AI Analysis
        const analysis = aiService.analyzeTicket(data.subject, data.description);

        // 2. File Uploads
        const attachments: TicketAttachment[] = [];
        for (const file of data.files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${data.tenantId}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('support-attachments')
                    .upload(filePath, file);

                if (uploadError) {
                    console.warn('File upload failed (bucket might not exist):', uploadError);
                    // Continue without file or handle error? For MVP we continue
                } else if (uploadData) {
                    const { data: { publicUrl } } = supabase.storage.from('support-attachments').getPublicUrl(filePath);
                    attachments.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: publicUrl
                    });
                }
            } catch (e) {
                console.error('File upload exception:', e);
            }
        }

        // 3. Create Ticket Object
        const ticketData: SupportTicketInsert = {
            tenant_id: data.tenantId,
            origin: 'klyver_master', // or 'admin_panel'
            subject: data.subject,
            message: data.description, // original description
            contact_name: data.contactName,
            contact_email: data.contactEmail,
            status: 'open',
            metadata: {
                category: data.category,
                urgency: analysis.urgencyLevel, // AI Determined
                ai_analysis: analysis,
                attachments: attachments,
                farm_slug: '', // Should be fetched but context provides it usually
                farm_name: data.tenantName
            } as any
        };

        const { data: newTicket, error } = await supabase
            .from('support_tickets')
            .insert(ticketData as any)
            .select()
            .single();

        if (error) throw error;

        // 4. Send Email Notification (Mock)
        this.sendNotificationEmail(newTicket.id, data.contactEmail, data.contactName, 'Ticket Criado');

        return newTicket;
    },

    async listTickets(tenantId?: string) {
        let query = supabase
            .from('support_tickets')
            .select('*, tenants(display_name, slug)')
            .order('created_at', { ascending: false });

        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((t: any) => {
            const metadata = t.metadata || {};
            return {
                id: t.id,
                tenantId: t.tenant_id,
                tenantName: t.tenants?.display_name || metadata.farm_name || 'Desconhecido',
                subject: t.subject,
                description: t.message,
                category: metadata.category || t.origin || 'Geral',
                status: t.status || 'open',
                urgency: metadata.urgency || 'baixa',
                createdAt: t.created_at,
                aiAnalysis: metadata.ai_analysis || null,
                attachments: metadata.attachments || [],
                messages: []
            } as EnhancedTicket;
        });
    },

    async updateStatus(ticketId: string, status: string) {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() } as any)
            .eq('id', ticketId);

        if (error) throw error;
    },

    // Mock Email Notification
    async sendNotificationEmail(ticketId: string, email: string, name: string, event: string) {
        console.log(`[EMAIL MOCK] To: ${email} | Subject: Atualização no seu atendimento | Event: ${event}`);
        // In prod this would call an Edge Function
    }
};
