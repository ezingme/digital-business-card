import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBio = async (
  name: string,
  title: string,
  company: string,
  tone: 'professional' | 'creative' | 'friendly'
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  const prompt = `
    Write a short, engaging professional bio (max 60 words) for a digital business card.
    Name: ${name}
    Job Title: ${title}
    Company: ${company}
    Tone: ${tone}
    
    Return only the bio text, no markdown formatting or quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "Could not generate bio.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate content. Please try again.";
  }
};

export const generateServices = async (
  title: string,
  company: string
): Promise<{ title: string; desc: string }[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 3 professional services that a ${title} at ${company} might offer. Keep titles short and descriptions under 10 words.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              desc: { type: Type.STRING },
            },
            required: ['title', 'desc'],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error (Services):", error);
    return [];
  }
};

export const suggestColorPalette = async (industry: string): Promise<string[]> => {
   // Simplified for this demo to just return text, but ideally returns JSON
   // Implementation placeholder
   return [];
}
