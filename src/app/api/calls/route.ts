import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.API_BASE_URL) {
      throw new Error('API_BASE_URL não definida');
    }

    const response = await fetch(
      `${process.env.API_BASE_URL}/api/calls?limit=100`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);

    return NextResponse.json(calls);
  } catch (error) {
    console.error('Erro na rota de API:', error);
    return NextResponse.json([], { status: 500 });
  }
}