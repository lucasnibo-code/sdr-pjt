import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      return NextResponse.json({ debug: "Erro: Variável NEXT_PUBLIC_API_BASE_URL não encontrada" }, { status: 500 });
    }

    // Aguarda os parâmetros da URL (importante no Next.js 15)
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ debug: "Erro: ID não informado na URL" }, { status: 400 });
    }

    // Busca a lista no Render para poder filtrar pelo ID
    const response = await fetch(`${baseUrl}/api/calls?limit=3000`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ debug: "Render falhou", status: response.status }, { status: 502 });
    }

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);

    // Procura a chamada específica pelo ID ou callId
    const found = calls.find((c: any) => 
      String(c?.id) === String(id) || String(c?.callId) === String(id)
    );

    if (!found) {
      return NextResponse.json({ debug: "Chamada não encontrada", id_buscado: id }, { status: 404 });
    }

    // Retorna APENAS o objeto da chamada encontrada
    return NextResponse.json(found);

  } catch (error: any) {
    return NextResponse.json({ 
      debug: "Erro na rota de DETALHE",
      mensagem: error.message 
    }, { status: 500 });
  }
}