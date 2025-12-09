export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            tenants: {
                Row: {
                    active_users: number | null
                    admin_base_url: string | null
                    cnpj: string | null
                    created_at: string | null
                    custom_domain_admin: string | null
                    custom_domain_store: string | null
                    display_name: string | null
                    domain_activated_at: string | null
                    domain_status: string | null
                    email: string | null
                    id: string
                    last_activity: string | null
                    legal_name: string | null
                    logo_url: string | null
                    monthly_revenue: number | null
                    phone: string | null
                    plan_code: string | null
                    plan_label: string | null
                    plan_tier: string | null
                    responsible_name: string | null
                    risk_score: number | null
                    slug: string | null
                    status: string | null
                    store_base_url: string | null
                    updated_at: string | null
                    verification_token: string | null
                }
                Insert: {
                    active_users?: number | null
                    admin_base_url?: string | null
                    cnpj?: string | null
                    created_at?: string | null
                    custom_domain_admin?: string | null
                    custom_domain_store?: string | null
                    display_name?: string | null
                    domain_activated_at?: string | null
                    domain_status?: string | null
                    email?: string | null
                    id?: string
                    last_activity?: string | null
                    legal_name?: string | null
                    logo_url?: string | null
                    monthly_revenue?: number | null
                    phone?: string | null
                    plan_code?: string | null
                    plan_label?: string | null
                    plan_tier?: string | null
                    responsible_name?: string | null
                    risk_score?: number | null
                    slug?: string | null
                    status?: string | null
                    store_base_url?: string | null
                    updated_at?: string | null
                    verification_token?: string | null
                }
                Update: {
                    active_users?: number | null
                    admin_base_url?: string | null
                    cnpj?: string | null
                    created_at?: string | null
                    custom_domain_admin?: string | null
                    custom_domain_store?: string | null
                    display_name?: string | null
                    domain_activated_at?: string | null
                    domain_status?: string | null
                    email?: string | null
                    id?: string
                    last_activity?: string | null
                    legal_name?: string | null
                    logo_url?: string | null
                    monthly_revenue?: number | null
                    phone?: string | null
                    plan_code?: string | null
                    plan_label?: string | null
                    plan_tier?: string | null
                    responsible_name?: string | null
                    risk_score?: number | null
                    slug?: string | null
                    status?: string | null
                    store_base_url?: string | null
                    updated_at?: string | null
                    verification_token?: string | null
                }
                Relationships: []
            },
            support_tickets: {
                Row: {
                    id: string
                    tenant_id: string | null
                    user_id: string | null
                    requester_name: string | null
                    requester_phone: string | null
                    subject: string | null
                    message: string | null
                    urgency: string | null
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id?: string | null
                    user_id?: string | null
                    requester_name?: string | null
                    requester_phone?: string | null
                    subject?: string | null
                    message?: string | null
                    urgency?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string | null
                    user_id?: string | null
                    requester_name?: string | null
                    requester_phone?: string | null
                    subject?: string | null
                    message?: string | null
                    urgency?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "support_tickets_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    }
                ]
            },
            store_plans: {
                Row: {
                    id: string
                    name: string
                    code: string
                    price_month: number
                    price_year: number
                    limits: any // JSON
                    features: string[] | null // Array of text
                    tenant_id: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    price_month: number
                    price_year: number
                    limits?: any
                    features?: string[] | null
                    tenant_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    price_month?: number
                    price_year?: number
                    limits?: any
                    features?: string[] | null
                    tenant_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        // ... other tables omitted for brevity unless needed
    }
    Views: {
        [_ in never]: never
    }
    Functions: {
        [_ in never]: never
    }
    Enums: {
        [_ in never]: never
    }
    CompositeTypes: {
        [_ in never]: never
    }
}
