import { GoogleGenAI } from "@google/genai";
import { Tenant } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const apiKey = process.env.API_KEY || '';

export const analyzeTenantRisk = async (tenant: Tenant): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key não configurada para o Gemini.");
    return "API Key não configurada. Impossível realizar análise IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Você é um especialista em Customer Success para um SaaS de gestão de farmácias.
      Analise os dados desta farmácia e forneça um resumo curto (máximo 40 palavras) sobre o risco de churn.
      Seja direto, profissional e foque em dados.
      
      Dados da Farmácia:
      Nome: ${tenant.fantasyName}
      Plano Atual: ${tenant.planCode}
      Status: ${tenant.status}
      Última Atividade no Sistema: ${tenant.lastActivity}
      Faturamento Mensal Estimado: R$ ${tenant.monthlyRevenue}
      Score de Risco Atual: ${tenant.riskScore}/100
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Análise indisponível no momento.";
  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return "Erro ao conectar com a IA. Verifique sua conexão.";
  }
};