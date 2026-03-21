import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://lasonya-snooty-bettina.ngrok-free.dev/api/calls?limit=100', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
      // Desativando cache agressivo para facilitar validação em tempo real
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Garantindo que retornamos sempre um array
    const calls = Array.isArray(data) ? data : (data.calls || []);
    
    return NextResponse.json(calls);
  } catch (error) {
    console.error('Erro na rota de API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
