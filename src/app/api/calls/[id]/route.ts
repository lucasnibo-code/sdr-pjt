import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    if (!process.env.API_BASE_URL) {
      throw new Error('API_BASE_URL não definida');
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    // Buscamos a lista (ou idealmente um endpoint específico do seu backend)
    const response = await fetch(`${process.env.API_BASE_URL}/api/calls?limit=100`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Falha na API externa');

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);

    // Procura o ID exato
    const found = calls.find((c: any) => String(c?.id) === id || String(c?.callId) === id);

    if (!found) {
      return NextResponse.json({ error: 'Chamada não encontrada' }, { status: 404 });
    }

    return NextResponse.json(found);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}