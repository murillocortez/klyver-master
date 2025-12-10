
export interface AIAnalysisResult {
    urgencyScore: number;
    urgencyLevel: 'alta' | 'media' | 'baixa';
    category: string;
    summary: string;
    riskAssessment: {
        userErrorProbability: number;
        technicalErrorProbability: number;
    };
    recommendedActions: string[];
}

export const aiService = {
    analyzeTicket(subject: string, description: string): AIAnalysisResult {
        const text = `${subject} ${description}`.toLowerCase();

        // Keyworks for Urgency
        const highUrgencyKeywords = ['pagamento', 'fiscal', 'nfe', 'fora do ar', 'travado', 'perda de dados', 'cobrança', 'bloqueado', 'expirou', 'urgente'];
        const mediumUrgencyKeywords = ['erro', 'bug', 'falha', 'não funciona', 'api', 'integração', 'lento', 'senha', 'login'];

        let urgencyScore = 0;

        highUrgencyKeywords.forEach(w => { if (text.includes(w)) urgencyScore += 30; });
        mediumUrgencyKeywords.forEach(w => { if (text.includes(w)) urgencyScore += 10; });

        let urgencyLevel: 'alta' | 'media' | 'baixa' = 'baixa';
        if (urgencyScore >= 30) urgencyLevel = 'alta';
        else if (urgencyScore >= 10) urgencyLevel = 'media';

        // Keywords for Category
        let category = 'Geral';
        if (text.includes('fiscal') || text.includes('nfe')) category = 'Fiscal';
        else if (text.includes('pagamento') || text.includes('boleto') || text.includes('cartão')) category = 'Financeiro';
        else if (text.includes('impressora') || text.includes('imprimir')) category = 'Impressora';
        else if (text.includes('api') || text.includes('whatsapp')) category = 'Integrações';
        else if (text.includes('crm') || text.includes('cashback')) category = 'CRM';

        // Risk Assessment (Mock Logic)
        const technicalErrorProbability = urgencyLevel === 'alta' ? 80 : 40;
        const userErrorProbability = 100 - technicalErrorProbability;

        // Recommendations
        const recommendations = [];
        if (category === 'Fiscal') recommendations.push('Verificar validade do Certificado Digital A1.');
        if (category === 'Financeiro') recommendations.push('Consultar status da assinatura no painel.');
        if (category === 'Integrações') recommendations.push('Testar conexão da API no menu Configurações.');
        if (text.includes('impressora')) recommendations.push('Verificar se o QZ Tray está rodando no PC.');

        return {
            urgencyScore,
            urgencyLevel,
            category,
            summary: `Ticket classificado como ${urgencyLevel.toUpperCase()} devido a palavras-chave identificadas.`,
            riskAssessment: { userErrorProbability, technicalErrorProbability },
            recommendedActions: recommendations
        };
    }
};

export const faqService = {
    categories: [
        { id: 'store', title: 'Sistema da Loja', icon: 'Store' },
        { id: 'admin', title: 'Sistema Admin', icon: 'LayoutDashboard' },
        { id: 'fiscal', title: 'Fiscal e NFe', icon: 'FileText' },
        { id: 'printer', title: 'Impressoras', icon: 'Printer' },
        { id: 'crm', title: 'CRM e Cashback', icon: 'Users' },
        { id: 'whatsapp', title: 'API WhatsApp', icon: 'MessageCircle' },
        { id: 'billing', title: 'Pagamentos', icon: 'CreditCard' },
        { id: 'general', title: 'Geral', icon: 'HelpCircle' }
    ],

    kbArticles: [
        { id: '1', title: 'Como configurar Certificado A1', category: 'fiscal', tags: ['nfe', 'certificado'], content: 'Passo a passo...' },
        { id: '2', title: 'Cupom fiscal cortando errado', category: 'printer', tags: ['impressora', 'corte', 'layout'], content: 'Ajuste a largura do papel nas configurações do QZ Tray.' },
        { id: '3', title: 'Integração WhatsApp desconectada', category: 'whatsapp', tags: ['api', 'conexão'], content: 'Leia o QR Code novamente no menu de configurações.' },
        { id: '4', title: 'Como renovar assinatura', category: 'billing', tags: ['pagamento', 'plano'], content: 'Acesse o menu Financeiro > Assinatura.' },
    ],

    search(query: string) {
        if (!query) return [];
        const q = query.toLowerCase();
        return this.kbArticles.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.tags.some(t => t.includes(q)) ||
            a.content.toLowerCase().includes(q)
        );
    }
};
