import { NextRequest, NextResponse } from 'next/server';
import { getAI } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { topic, researchSummary } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    if (!researchSummary || typeof researchSummary !== 'string') {
      return NextResponse.json(
        { error: 'Research summary is required and must be a string' },
        { status: 400 }
      );
    }

    const ai = getAI();

    const prompt = `
      You are a professional, empathetic, and witty blog writer. Write a **highly humanized** blog post about the specific title: "${topic}".
      
      Use the following background research notes (which include dates) to ground the article in fact, but write specifically for the chosen title:
      ${researchSummary}

      Requirements:
      1. Return the result as a JSON object.
      2. "title": The final optimized title (should match the requested topic closely but can be polished).
      3. "content": The full blog post body in HTML format (use <h2>, <h3>, <p>, <ul>, etc.).
      4. **Tone**: Conversational, personal, and authoritative. Use sentence variety (mix short and long). Avoid stiff "AI-like" transitions (e.g., avoid "In conclusion", "Delving into", "In the rapidly evolving landscape").
      5. **Timeliness**: Incorporate the dates found in the research to show the reader this content is fresh and up-to-date.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['title', 'content'],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('Empty response from AI');
    }

    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Post generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post content' },
      { status: 500 }
    );
  }
}
