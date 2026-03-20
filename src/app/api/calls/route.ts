
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://lasonya-snooty-bettina.ngrok-free.dev/api/calls?limit=100', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // Cache por 60 segundos
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar dados da API externa');
    }

    const data = await response.json();
    
    // A API pode retornar o array diretamente ou dentro de um objeto 'calls'
    const calls = Array.isArray(data) ? data : (data.calls || []);
    
    return NextResponse.json(calls);
  } catch (error) {
    console.error('Erro na rota de API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
