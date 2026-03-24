import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// ... resto do seu código (importações, funções GET, etc.)

// 🚩 1. Adicionamos o 'request: Request' para a API conseguir ler os filtros da URL
export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      return NextResponse.json({ error: 'Configuração NEXT_PUBLIC_API_BASE_URL ausente' }, { status: 500 });
    }

    // 🚩 2. Pegamos as datas exatas que o Dashboard pediu
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 🚩 3. Montamos a URL do Back-end enxertando as datas (se elas existirem)
    let fetchUrl = `${baseUrl}/api/calls?limit=3000`;
    if (startDate && endDate) {
      fetchUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    // Busca a lista no Render passando a URL dinâmica
    const response = await fetch(fetchUrl, {
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