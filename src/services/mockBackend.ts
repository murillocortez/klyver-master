import { MOCK_TENANTS, PLANS, MOCK_PAYMENTS, MOCK_ACCESS_LOGS } from '../constants';
import { ApiResponse, Tenant, Plan, Payment, AccessLog } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to calculate days remaining
const getDaysRemaining = (nextBillingDate: string): number => {
  const now = new Date();
  const billing = new Date(nextBillingDate);
  const diffTime = billing.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * ENDPOINT 1: GET /api/license-status?tenant_id={id}
 */
export const apiGetLicenseStatus = async (tenantId: string): Promise<ApiResponse<any>> => {
  await delay(600); // Simulate network

  const tenant = MOCK_TENANTS.find(t => t.tenant_id === tenantId);

  if (!tenant) {
    return {
      success: false,
      status_code: 404,
      error: 'Tenant ID not found',
    };
  }

  // If blocked, return limited info
  if (tenant.status === 'blocked') {
    return {
      success: false,
      status_code: 403,
      error: 'Access blocked due to non-payment or administrative action.',
      data: {
        status: 'blocked',
        days_remaining: 0,
      }
    };
  }

  const plan = PLANS.find(p => p.id === tenant.planCode);
  const daysRemaining = getDaysRemaining(tenant.nextBillingDate);

  // Map internal features to external API format
  const features = plan ? {
    cashback: plan.features.cashback,
    curve_abc: plan.features.curva_abc,
    lista_inteligente: plan.features.lista_inteligente,
    multi_loja: plan.features.multi_loja,
    api_whatsapp: plan.features.api_whatsapp,
    crm_campaigns: plan.features.crm_campaigns,
    nota_fiscal: plan.features.nota_fiscal
  } : {};

  return {
    success: true,
    status_code: 200,
    data: {
      status: tenant.status,
      plano_atual: plan?.name,
      valor_atual: plan?.priceMonthly,
      days_remaining: daysRemaining,
      features: features,
      server_timestamp: new Date().toISOString()
    }
  };
};

/**
 * ENDPOINT 2: GET /api/features?tenant_id={id}
 */
export const apiGetFeatures = async (tenantId: string): Promise<ApiResponse<any>> => {
  await delay(400);

  const tenant = MOCK_TENANTS.find(t => t.tenant_id === tenantId);

  if (!tenant) {
    return { success: false, status_code: 404, error: 'Tenant ID not found' };
  }

  const plan = PLANS.find(p => p.id === tenant.planCode);

  if (!plan) return { success: false, status_code: 500, error: 'Plan configuration error' };

  return {
    success: true,
    status_code: 200,
    data: plan.features
  };
};

/**
 * ENDPOINT 3: GET /api/payments-history?tenant_id={id}
 */
export const apiGetPaymentsHistory = async (tenantId: string): Promise<ApiResponse<Payment[]>> => {
  await delay(500);

  // We need internal ID for payments, so we find tenant first
  const tenant = MOCK_TENANTS.find(t => t.tenant_id === tenantId);

  if (!tenant) {
    return { success: false, status_code: 404, error: 'Tenant ID not found' };
  }

  const payments = MOCK_PAYMENTS.filter(p => p.tenantId === tenant.id);

  return {
    success: true,
    status_code: 200,
    data: payments
  };
};

/**
 * ENDPOINT 4: POST /api/log-access
 */
export const apiLogAccess = async (payload: { tenant_id: string; user_id: string; origin: string; timestamp: string }): Promise<ApiResponse<any>> => {
  await delay(300);

  const { tenant_id, user_id, origin, timestamp } = payload;

  if (!tenant_id || !user_id) {
    return { success: false, status_code: 400, error: 'Missing tenant_id or user_id' };
  }

  const tenant = MOCK_TENANTS.find(t => t.tenant_id === tenant_id);

  // In a real DB we would save this
  const newLog: AccessLog = {
    id: `log_${Date.now()}`,
    tenantId: tenant ? tenant.id : 'unknown',
    userId: user_id,
    timestamp: timestamp || new Date().toISOString(),
    origin: origin as any || 'unknown',
    status: tenant && tenant.status === 'active' ? 'success' : 'denied',
    message: tenant ? `Status: ${tenant.status}` : 'Tenant not found'
  };

  // Push to mock memory (for session duration)
  MOCK_ACCESS_LOGS.unshift(newLog);

  return {
    success: true,
    status_code: 201,
    data: { logged: true, log_id: newLog.id }
  };
};