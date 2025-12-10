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
                    plan_id: string | null
                    responsible_name: string | null
                    responsible_email: string | null
                    risk_score: number | null
                    slug: string | null
                    status: string | null
                    store_base_url: string | null
                    updated_at: string | null
                    verification_token: string | null
                    api_key: string | null
                    onboarding_status: string | null
                    trial_end: string | null
                    current_period_start: string | null
                    current_period_end: string | null
                    last_payment_at: string | null
                    next_payment_due_at: string | null
                    blocked_reason: string | null
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
                    plan_id?: string | null
                    responsible_name?: string | null
                    responsible_email?: string | null
                    risk_score?: number | null
                    slug?: string | null
                    status?: string | null
                    store_base_url?: string | null
                    updated_at?: string | null
                    verification_token?: string | null
                    onboarding_status?: string | null
                    trial_end?: string | null
                    current_period_start?: string | null
                    current_period_end?: string | null
                    last_payment_at?: string | null
                    next_payment_due_at?: string | null
                    blocked_reason?: string | null
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
                    plan_id?: string | null
                    responsible_name?: string | null
                    responsible_email?: string | null
                    risk_score?: number | null
                    slug?: string | null
                    status?: string | null
                    store_base_url?: string | null
                    updated_at?: string | null
                    verification_token?: string | null
                    onboarding_status?: string | null
                    trial_end?: string | null
                    current_period_start?: string | null
                    current_period_end?: string | null
                    last_payment_at?: string | null
                    next_payment_due_at?: string | null
                    blocked_reason?: string | null
                }
                Relationships: []
            },
            invoices: {
                Row: {
                    id: string
                    tenant_id: string
                    plan_id: string | null
                    amount: number
                    currency: string
                    status: string
                    due_date: string | null
                    paid_at: string | null
                    external_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    plan_id?: string | null
                    amount: number
                    currency?: string
                    status?: string
                    due_date?: string | null
                    paid_at?: string | null
                    external_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    plan_id?: string | null
                    amount?: number
                    currency?: string
                    status?: string
                    due_date?: string | null
                    paid_at?: string | null
                    external_id?: string | null
                    created_at?: string | null
                }
                Relationships: []
            },
            payments: {
                Row: {
                    id: string
                    tenant_id: string
                    invoice_id: string | null
                    amount: number
                    method: string | null
                    status: string | null
                    external_id: string | null
                    created_at: string | null
                    confirmed_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    invoice_id?: string | null
                    amount: number
                    method?: string | null
                    status?: string | null
                    external_id?: string | null
                    created_at?: string | null
                    confirmed_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    invoice_id?: string | null
                    amount?: number
                    method?: string | null
                    status?: string | null
                    external_id?: string | null
                    created_at?: string | null
                    confirmed_at?: string | null
                }
                Relationships: []
            },
            support_tickets: {
                Row: {
                    id: string
                    tenant_id: string | null
                    origin: string | null
                    subject: string | null
                    message: string | null
                    contact_name: string | null
                    contact_email: string | null
                    status: string | null
                    metadata: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id?: string | null
                    origin?: string | null
                    subject?: string | null
                    message?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    status?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string | null
                    origin?: string | null
                    subject?: string | null
                    message?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    status?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            store_plans: {
                Row: {
                    id: string
                    name: string
                    code: string
                    price_month: number
                    price_year: number
                    limits: Json | null
                    features: Json | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    price_month: number
                    price_year: number
                    limits?: Json | null
                    features?: Json | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    price_month?: number
                    price_year?: number
                    limits?: Json | null
                    features?: Json | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    role: string | null
                    tenant_id: string | null
                    password_hash: string | null
                    temp_password_created: string | null
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    role?: string | null
                    tenant_id?: string | null
                    password_hash?: string | null
                    temp_password_created?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    role?: string | null
                    tenant_id?: string | null
                    password_hash?: string | null
                    temp_password_created?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    }
                ]
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
