"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { ResearchSource, ResearchResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performResearch = async (topic: string): Promise<ResearchResult> => {
  const ai = getAI();
  
  let summary = "";
  const sources: ResearchSource[] = [];
  
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

    summary = response.text || "No research generated.";
    
    // Extract sources from grounding metadata
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
  } catch (error) {
    console.error("Research step failed:", error);
    throw new Error("Failed to research topic.");
  }

  // Step 2: Analyze the search results to get structured trend data
  try {
    const analysisPrompt = `
      Analyze the following research summary about "${topic}" and extract trend intelligence.
      
      Research Summary:
      ${summary}
      
      Return a JSON object with the following properties:
      - sentiment: "positive", "neutral", or "negative"
      - key_events: Array of key event strings
      - sources_news: Array of news source names mentioned
      - sources_social: Array of social media sources mentioned
    `;

    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            key_events: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources_news: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources_social: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["sentiment", "key_events", "sources_news", "sources_social"]
        }
      }
    });

    const analysisText = analysisResponse.text;
    const trendAnalysis = analysisText ? JSON.parse(analysisText) : {
      sentiment: 'neutral',
      key_events: [],
      sources_news: [],
      sources_social: []
    };

    // Ensure sentiment is valid
    if (!['positive', 'neutral', 'negative'].includes(trendAnalysis.sentiment)) {
        trendAnalysis.sentiment = 'neutral';
    }

    return { summary, sources, trendAnalysis };

  } catch (error) {
    console.error("Analysis step failed:", error);
    // Fallback
    return {
      summary,
      sources,
      trendAnalysis: {
        sentiment: 'neutral',
        key_events: [],
        sources_news: [],
        sources_social: []
      }
    };
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