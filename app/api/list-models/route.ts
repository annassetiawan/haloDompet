import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset' },
        { status: 500 }
      );
    }

    // Call Google API directly to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch models', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter models yang support generateContent
    const contentGenerationModels = data.models
      ?.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
      })) || [];

    return NextResponse.json({
      totalModels: data.models?.length || 0,
      contentGenerationModels: contentGenerationModels,
      recommendedForHaloDompet: contentGenerationModels
        .filter((m: any) =>
          m.name.includes('flash') && !m.name.includes('exp')
        )
        .map((m: any) => m.name.replace('models/', '')),
      allModels: data.models?.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
      })) || [],
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to list models',
        details: error.message
      },
      { status: 500 }
    );
  }
}
