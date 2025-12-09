import { Plan, Tenant, Ticket, AnalyticsData, FAQItem, Payment, AccessLog } from './types';

export const PLANS: Plan[] = [
  {
    id: 'p_start',
    name: 'START',
    priceMonthly: 199.00,
    priceYearly: 1990.00,
    maxClients: 500,
    maxUsers: 2,
    features: {
      cashback: true,
      crm_campaigns: false,
      curva_abc: false,
      api_whatsapp: false,
      nota_fiscal: true,
      multi_loja: false,
      lista_inteligente: false,
    },
  },
  {
    id: 'p_premium',
    name: 'PREMIUM',
    priceMonthly: 399.00,
    priceYearly: 3990.00,
    maxClients: 2000,
    maxUsers: 5,
    features: {
      cashback: true,
      crm_campaigns: true,
      curva_abc: true,
      api_whatsapp: false,
      nota_fiscal: true,
      multi_loja: false,
      lista_inteligente: true,
    },
  },
  {
    id: 'p_advanced',
    name: 'ADVANCED',
    priceMonthly: 699.00,
    priceYearly: 6990.00,
    maxClients: 10000,
    maxUsers: 15,
    features: {
      cashback: true,
      crm_campaigns: true,
      curva_abc: true,
      api_whatsapp: true,
      nota_fiscal: true,
      multi_loja: true,
      lista_inteligente: true,
    },
  },
  {
    id: 'p_enterprise',
    name: 'ENTERPRISE',
    priceMonthly: 1299.00,
    priceYearly: 12990.00,
    maxClients: 999999,
    maxUsers: 999,
    features: {
      cashback: true,
      crm_campaigns: true,
      curva_abc: true,
      api_whatsapp: true,
      nota_fiscal: true,
      multi_loja: true,
      lista_inteligente: true,
    },
  },
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    tenant_id: 'FV-1001-ABCD',
    api_key: 'FV-KEY-1001-SECURE-HASH',
    fantasyName: 'Farmácia São João',
    corporateName: 'São João Medicamentos LTDA',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 98765-4321',
    email: 'contato@saojoao.com',
    responsibleName: 'João Silva',
    planId: 'p_premium',
    status: 'active',
    createdAt: '2023-01-15T10:00:00Z',
    nextBillingDate: '2023-11-15T10:00:00Z',
    lastActivity: '2023-10-26T14:30:00Z',
    monthlyRevenue: 45000,
    activeUsers: 4,
    riskScore: 12,
  },
  {
    id: '2',
    tenant_id: 'FV-1002-XYZA',
    api_key: 'FV-KEY-1002-SECURE-HASH',
    fantasyName: 'Drogarias Max',
    corporateName: 'Max Drogarias SA',
    cnpj: '98.765.432/0001-10',
    phone: '(21) 91234-5678',
    email: 'financeiro@drogariasmax.com',
    responsibleName: 'Maria Oliveira',
    planId: 'p_enterprise',
    status: 'active',
    createdAt: '2023-03-10T09:00:00Z',
    nextBillingDate: '2023-11-10T09:00:00Z',
    lastActivity: '2023-10-27T08:15:00Z',
    monthlyRevenue: 120000,
    activeUsers: 25,
    riskScore: 5,
  },
  {
    id: '3',
    tenant_id: 'FV-1003-PEND',
    api_key: 'FV-KEY-1003-SECURE-HASH',
    fantasyName: 'FarmaVida Econômica',
    corporateName: 'FV Econômica EIRELI',
    cnpj: '45.123.789/0001-55',
    phone: '(31) 99887-7665',
    email: 'gerencia@fveconomica.com',
    responsibleName: 'Carlos Santos',
    planId: 'p_start',
    status: 'pending',
    createdAt: '2023-06-20T11:00:00Z',
    nextBillingDate: '2023-10-25T11:00:00Z', // Past due
    lastActivity: '2023-10-20T16:00:00Z',
    monthlyRevenue: 15000,
    activeUsers: 1,
    riskScore: 75,
  },
  {
    id: '4',
    tenant_id: 'FV-1004-BLCK',
    api_key: 'FV-KEY-1004-SECURE-HASH',
    fantasyName: 'Farmácia Popular Centro',
    corporateName: 'Popular Centro LTDA',
    cnpj: '11.222.333/0001-44',
    phone: '(41) 98877-1122',
    email: 'admin@popularcentro.com',
    responsibleName: 'Ana Pereira',
    planId: 'p_start',
    status: 'blocked',
    createdAt: '2023-02-01T08:00:00Z',
    nextBillingDate: '2023-09-01T08:00:00Z',
    lastActivity: '2023-08-28T18:00:00Z',
    monthlyRevenue: 8000,
    activeUsers: 0,
    riskScore: 90,
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't_1',
    tenantId: '1',
    tenantName: 'Farmácia São João',
    category: 'FISCAL',
    subject: 'Erro na emissão de NFC-e',
    description: 'Estamos recebendo erro de rejeição 503 ao tentar emitir notas.',
    urgency: 'high',
    status: 'open',
    createdAt: '2023-10-27T10:00:00Z',
    messages: [
      { sender: 'user', text: 'Não consigo emitir notas fiscais desde hoje cedo.', date: '2023-10-27T10:00:00Z' }
    ]
  },
  {
    id: 't_2',
    tenantId: '2',
    tenantName: 'Drogarias Max',
    category: 'WHATSAPP',
    subject: 'Dúvida sobre integração API',
    description: 'Como configuro o bot para resposta automática?',
    urgency: 'low',
    status: 'answered',
    createdAt: '2023-10-26T14:00:00Z',
    messages: [
      { sender: 'user', text: 'Olá, preciso de ajuda com o bot do WhatsApp.', date: '2023-10-26T14:00:00Z' },
      { sender: 'support', text: 'Olá! Você pode configurar isso no menu Configurações > Integrações.', date: '2023-10-26T14:30:00Z' }
    ]
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'Sistema da loja',
    question: 'Como cadastrar um novo produto manualmente?',
    answer: 'Vá até o menu Estoque > Produtos e clique no botão "Novo Produto". Preencha os campos obrigatórios e salve.'
  },
  {
    id: 'faq_2',
    category: 'Configurações fiscais',
    question: 'Como atualizar o certificado digital A1?',
    answer: 'Acesse Configurações > Fiscal > Certificado. Faça o upload do arquivo .pfx e insira a senha do certificado.'
  },
  {
    id: 'faq_3',
    category: 'Integração de impressora',
    question: 'A impressora não está cortando o papel automaticamente.',
    answer: 'Verifique nas configurações de dispositivo se a opção "Guilhotina Automática" está ativada no driver da impressora.'
  },
  {
    id: 'faq_4',
    category: 'CRM e cashback',
    question: 'Como configurar a porcentagem de cashback por produto?',
    answer: 'No cadastro do produto, aba "Preços", existe um campo específico para definir a % de cashback daquele item.'
  },
  {
    id: 'faq_5',
    category: 'API WhatsApp',
    question: 'O QR Code desconecta com frequência.',
    answer: 'Certifique-se de que o celular conectado à internet está com a bateria otimizada desativada para o WhatsApp.'
  },
  {
    id: 'faq_6',
    category: 'Sistema administrativo',
    question: 'Como criar um novo usuário vendedor?',
    answer: 'Apenas usuários com perfil "Gerente" podem criar novos usuários em Configurações > Equipe > Novo Usuário.'
  }
];

export const ANALYTICS_DATA: AnalyticsData[] = [
  { month: 'Mai', mrr: 45000, newTenants: 12, churned: 1 },
  { month: 'Jun', mrr: 48500, newTenants: 15, churned: 2 },
  { month: 'Jul', mrr: 52000, newTenants: 18, churned: 0 },
  { month: 'Ago', mrr: 56000, newTenants: 20, churned: 1 },
  { month: 'Set', mrr: 61000, newTenants: 22, churned: 3 },
  { month: 'Out', mrr: 68000, newTenants: 25, churned: 1 },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay_1', tenantId: '1', amount: 399.00, date: '2023-10-15T10:00:00Z', status: 'paid', method: 'credit_card' },
  { id: 'pay_2', tenantId: '1', amount: 399.00, date: '2023-09-15T10:00:00Z', status: 'paid', method: 'credit_card' },
  { id: 'pay_3', tenantId: '2', amount: 1299.00, date: '2023-10-10T09:00:00Z', status: 'paid', method: 'boleto' },
  { id: 'pay_4', tenantId: '3', amount: 199.00, date: '2023-09-20T11:00:00Z', status: 'failed', method: 'credit_card' },
  { id: 'pay_5', tenantId: '3', amount: 199.00, date: '2023-08-20T11:00:00Z', status: 'paid', method: 'pix' },
];

export const MOCK_ACCESS_LOGS: AccessLog[] = [
  { id: 'log_1', tenantId: '1', userId: 'user_1', timestamp: '2023-10-27T08:00:00Z', origin: 'store', status: 'success' },
  { id: 'log_2', tenantId: '1', userId: 'user_2', timestamp: '2023-10-27T08:05:00Z', origin: 'admin', status: 'success' },
  { id: 'log_3', tenantId: '3', userId: 'user_3', timestamp: '2023-10-27T09:00:00Z', origin: 'store', status: 'denied', message: 'Pending payment' },
  { id: 'log_4', tenantId: '4', userId: 'user_4', timestamp: '2023-10-27T10:00:00Z', origin: 'mobile', status: 'denied', message: 'Account blocked' },
];