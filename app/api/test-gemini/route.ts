import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Test beberapa model yang mungkin tersedia
    const modelsToTest = [
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'models/gemini-2.0-flash-exp',
      'models/gemini-1.5-flash-latest',
    ];

    const results = [];

    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();

        results.push({
          model: modelName,
          status: 'SUCCESS ✅',
          response: text.substring(0, 50) + '...',
        });
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'FAILED ❌',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      apiKeyConfigured: true,
      results: results,
      recommendation: results.find(r => r.status.includes('SUCCESS'))?.model || 'No working model found',
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
