import { NextRequest, NextResponse } from 'next/server';
import { getAI } from '@/lib/gemini';

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

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Create a high-quality, professional blog featured image for the topic: "${topic}".
        Style guidelines: Modern, minimalist, editorial illustration, abstract tech or business concept, soft gradient lighting (purple, blue, orange). 
        No text in the image.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const image = response.generatedImages?.[0]?.image;
    if (image && image.imageBytes) {
      return NextResponse.json({
        imageUrl: `data:image/jpeg;base64,${image.imageBytes}`,
      });
    }

    return NextResponse.json({ imageUrl: null });
  } catch (error) {
    console.error('Image generation API error:', error);
    // Return null instead of error to allow process to continue
    return NextResponse.json({ imageUrl: null });
  }
}
