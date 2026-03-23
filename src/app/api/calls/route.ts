import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    // 1. Usando o nome exato que está no seu Vercel
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      console.error("ERRO: NEXT_PUBLIC_API_BASE_URL não encontrada!");
      return NextResponse.json({ error: 'Configuração de API ausente' }, { status: 500 });
    }

    const { id } = await params;

    // 2. Chamada para o seu Render (porto-58em.onrender.com)
    const response = await fetch(`${baseUrl}/api/calls?limit=100`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao conectar no backend Render' }, { status: 502 });
    }

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);

    const found = calls.find((c: any) => 
      String(c?.id) === String(id) || String(c?.callId) === String(id)
    );

    if (!found) {
      return NextResponse.json({ error: 'Chamada não encontrada no banco do Render' }, { status: 404 });
    }

    return NextResponse.json(found);

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro de conexão: ' + error.message }, { status: 500 });
  }
}