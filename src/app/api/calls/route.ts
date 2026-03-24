import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// ... resto do seu código (importações, funções GET, etc.)

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      return NextResponse.json({ error: 'Configuração NEXT_PUBLIC_API_BASE_URL ausente' }, { status: 500 });
    }

    // Busca a lista completa (limitada a 100) no seu backend do Render
    const response = await fetch(`${baseUrl}/api/calls?limit=100`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Render respondeu com status: ${response.status}`);
    }

    const data = await response.json();
    
    // Retorna a lista completa para o frontend
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Erro na rota de LISTA:', error.message);
    return NextResponse.json({ error: 'Erro ao buscar lista: ' + error.message }, { status: 500 });
  }
}