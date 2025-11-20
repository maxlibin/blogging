import { GoogleGenAI, Type } from "@google/genai";
import { ResearchSource } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performResearch = async (topic: string): Promise<{ summary: string; sources: ResearchSource[] }> => {
  const ai = getAI();
  
  // Step 1: Research using Google Search Grounding
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Research the following topic in depth: "${topic}". 
      
      Directives:
      1. **LATEST NEWS**: Focus strictly on the most recent articles, news, and updates from the web (e.g., last 30 days if applicable).
      2. **DATES**: For every key finding or fact you list, you MUST explicitly mention the publication date of the source article (e.g., "As reported on Oct 15, 2024...").
      3. Summarize the key findings in bullet points suitable for a blog post outline.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No research generated.";
    
    // Extract sources from grounding metadata
    const sources: ResearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri || "#"
          });
        }
      });
    }

    return { summary: text, sources };
  } catch (error) {
    console.error("Research failed:", error);
    throw new Error("Failed to research topic.");
  }
};

export const writeBlogPost = async (topic: string, researchSummary: string): Promise<{ title: string; content: string }> => {
  const ai = getAI();

  try {
    const prompt = `
      You are a professional, empathetic, and witty blog writer. Write a **highly humanized** blog post about: "${topic}".
      
      Use the following research notes (which include dates):
      ${researchSummary}

      Requirements:
      1. Return the result as a JSON object.
      2. "title": A catchy, click-worthy title.
      3. "content": The full blog post body in HTML format (use <h2>, <h3>, <p>, <ul>, etc.).
      4. **Tone**: Conversational, personal, and authoritative. Use sentence variety (mix short and long). Avoid stiff "AI-like" transitions (e.g., avoid "In conclusion", "Delving into", "In the rapidly evolving landscape").
      5. **Timeliness**: Incorporate the dates found in the research to show the reader this content is fresh and up-to-date.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Writing failed:", error);
    throw new Error("Failed to generate blog post content.");
  }
};