export type UserRole = 'CEO' | 'ADMIN' | 'FINANCE' | 'SUPPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type TenantStatus = 'active' | 'pending' | 'blocked' | 'suspended';

export interface PlanFeatures {
  cashback: boolean;
  crm_campaigns: boolean;
  curva_abc: boolean; // "curve_abc" in API response
  api_whatsapp: boolean; // "api_whatsapp" in API response
  nota_fiscal: boolean;
  multi_loja: boolean;
  lista_inteligente: boolean; // New feature
}

export interface Plan {
  id: string;
  name: 'START' | 'PREMIUM' | 'ADVANCED' | 'ENTERPRISE';
  priceMonthly: number;
  priceYearly: number;
  maxClients: number;
  maxUsers: number;
  features: PlanFeatures;
}

// Mapped from 'tenants' table in Supabase
export interface Tenant {
  id: string; // UUID
  slug: string; // URL slug for the pharmacy
  tenant_id?: string; // Legacy/Display ID

  // Basic Info
  fantasyName: string; // mapped from display_name
  corporateName: string; // mapped from legal_name
  cnpj: string;
  phone: string;
  email: string;
  responsibleName: string; // mapped from responsible_name
  logoUrl?: string; // mapped from logo_url

  // Configuration
  custom_domain_admin?: string;
  custom_domain_store?: string;
  domain_status?: 'unverified' | 'pending_dns' | 'active';

  // Subscription Info
  planId: string; // mapped from plan_code
  status: TenantStatus;
  createdAt: string;
  nextBillingDate?: string;
  lastActivity?: string;

  // Activity Metrics (from added columns)
  monthlyRevenue: number; // mapped from monthly_revenue
  activeUsers: number; // mapped from active_users
  riskScore: number; // mapped from risk_score
}

export interface Ticket {
  id: string;
  tenantId: string;
  tenantName: string;
  category: 'SYSTEM' | 'ADMIN' | 'PRINTER' | 'FISCAL' | 'CRM' | 'WHATSAPP';
  subject: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'answered' | 'closed';
  createdAt: string;
  messages: { sender: 'user' | 'support'; text: string; date: string }[];
}

export interface FAQItem {
  id: string;
  category: 'Sistema da loja' | 'Sistema administrativo' | 'Integração de impressora' | 'Configurações fiscais' | 'CRM e cashback' | 'API WhatsApp';
  question: string;
  answer: string;
}

export interface AnalyticsData {
  month: string;
  mrr: number; // Monthly Recurring Revenue
  newTenants: number;
  churned: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: 'paid' | 'failed' | 'pending' | 'overdue';
  method: 'credit_card' | 'pix' | 'boleto';
}

export interface AccessLog {
  id: string;
  tenantId: string;
  userId: string;
  timestamp: string;
  origin: 'store' | 'admin' | 'mobile';
  status: 'success' | 'denied';
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status_code: number;
}