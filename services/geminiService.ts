import { GoogleGenAI } from "@google/genai";
import { Tenant } from "../types";

// NOTE: In a real app, this key comes from process.env.API_KEY
// The user is responsible for ensuring the key is available.
const apiKey = process.env.API_KEY || '';

export const analyzeTenantRisk = async (tenant: Tenant): Promise<string> => {
  if (!apiKey) {
    return "API Key não configurada. Impossível realizar análise IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Você é um especialista em Customer Success para um SaaS de gestão de farmácias.
      Analise os dados desta farmácia e forneça um resumo curto (máximo 50 palavras) sobre o risco de churn (cancelamento) e uma recomendação de ação.
      
      Dados da Farmácia:
      Nome: ${tenant.fantasyName}
      Plano: ${tenant.planId}
      Status: ${tenant.status}
      Última Atividade: ${tenant.lastActivity}
      Faturamento Mensal Estimado: R$ ${tenant.monthlyRevenue}
      Usuários Ativos: ${tenant.activeUsers}
      Score de Risco Atual: ${tenant.riskScore}/100
      
      Responda em texto corrido, profissional e direto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return "Erro ao conectar com a IA. Tente novamente mais tarde.";
  }
};
