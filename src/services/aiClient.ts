import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_MASTER_AI_KEY || "";

if (!API_KEY) {
  console.warn("VITE_MASTER_AI_KEY não configurada. Recursos de IA ficarão indisponíveis.");
}

// Instância segura do cliente Gemini
export function getGeminiClient() {
  if (!API_KEY) return null;
  return new GoogleGenerativeAI(API_KEY);
}

// Helper rápido para gerar texto
export async function generateText(prompt: string, modelName = "gemini-1.5-flash") {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("API Key não configurada");
  }
  
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
}
