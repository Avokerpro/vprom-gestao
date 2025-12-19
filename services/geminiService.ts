
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// Always use process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a technical description for a quote based on the client and selected items.
 */
export const generateQuoteDescription = async (clientName: string, items: { product: Product; qty: number }[]): Promise<string> => {
  // Use gemini-3-flash-preview for basic text tasks like technical description generation.
  // Updated to use correct product type property instead of category for label.
  const itemsList = items.map(i => `- ${i.qty}x ${i.product.name} (${i.product.type === 'service' ? 'Serviço' : 'Material'})`).join('\n');

  const prompt = `
    Você é um assistente técnico especialista em construção civil e revestimentos cimentícios para a empresa VPROM.
    Escreva uma descrição técnica profissional e comercial para um orçamento de obra.
    
    Cliente: ${clientName}
    Itens do Orçamento:
    ${itemsList}

    A empresa VPROM é especialista em chapas cimentícias para casas de madeira.
    Foque na qualidade, durabilidade e acabamento. Seja sucinto (máximo 1 parágrafo).
    Use português do Brasil formal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // The .text property directly returns the string output.
    return response.text?.trim() || "Descrição técnica não disponível no momento.";
  } catch (error) {
    console.error("Error generating quote description with Gemini:", error);
    return "Erro ao gerar descrição técnica. Por favor, escreva manualmente.";
  }
};
