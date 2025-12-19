
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

/**
 * Generates a technical description for a quote based on the client and selected items.
 */
export const generateQuoteDescription = async (clientName: string, items: { product: Product; qty: number }[]): Promise<string> => {
  // Always use process.env.API_KEY directly for initialization.
  // We initialize it inside the function to ensure the app doesn't crash at startup
  // if the key is provided asynchronously by the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
