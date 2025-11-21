import { NextRequest, NextResponse } from 'next/server';
import { getAI } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    const ai = getAI();
    let summary = '';
    const sources: Array<{ title: string; uri: string }> = [];

    // Step 1: Research using Google Search Grounding
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Research the following topic in depth: "${topic}". 
      
      Directives:
      1. **LATEST NEWS**: Focus strictly on the most recent articles, news, and updates from the web (e.g., last 30 days if applicable).
      2. **DATES**: For every key finding or fact you list, you MUST explicitly mention the publication date of the source article (e.g., "As reported on Oct 15, 2024...").
      3. Summarize the key findings in bullet points suitable for a blog post outline.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    summary = response.text || 'No research generated.';

    // Extract sources from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Web Source',
            uri: chunk.web.uri || '#',
          });
        }
      });
    }

    // Step 2: Analyze the search results to get structured trend data AND suggested topics
    const analysisPrompt = `
      Analyze the following research summary about "${topic}" and extract trend intelligence.
      Then, based on these trends, brainstorm 4 specific, high-performing blog post titles that would appeal to readers right now.
      
      Research Summary:
      ${summary}
      
      Return a JSON object with the following properties:
      - sentiment: "positive", "neutral", or "negative"
      - key_events: Array of key event strings
      - sources_news: Array of news source names mentioned
      - sources_social: Array of social media sources mentioned
      - suggested_topics: Array of objects, each containing:
          - title: A catchy, click-worthy blog post title.
          - rationale: A short sentence explaining why this title works based on the research.
    `;

    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: analysisPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            key_events: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources_news: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources_social: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['title', 'rationale'],
              },
            },
          },
          required: ['sentiment', 'key_events', 'sources_news', 'sources_social', 'suggested_topics'],
        },
      },
    });

    const analysisText = analysisResponse.text;
    const trendAnalysis = analysisText
      ? JSON.parse(analysisText)
      : {
          sentiment: 'neutral',
          key_events: [],
          sources_news: [],
          sources_social: [],
          suggested_topics: [],
        };

    // Ensure sentiment is valid
    if (!['positive', 'neutral', 'negative'].includes(trendAnalysis.sentiment)) {
      trendAnalysis.sentiment = 'neutral';
    }

    return NextResponse.json({
      summary,
      sources,
      trendAnalysis,
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to research topic' },
      { status: 500 }
    );
  }
}
