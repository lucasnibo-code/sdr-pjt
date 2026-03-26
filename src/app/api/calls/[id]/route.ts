import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      console.error("❌ Erro: NEXT_PUBLIC_API_BASE_URL não definida.");
      return NextResponse.json({ debug: "Erro: Variável NEXT_PUBLIC_API_BASE_URL não encontrada" }, { status: 500 });
    }

    // 🚩 Suporte ao Next.js 15: params agora é uma Promise e deve ser aguardada
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ debug: "Erro: ID não informado na URL" }, { status: 400 });
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    // Utilizamos o prefixo /api/ que confirmamos ser o correto no seu Render
    const targetUrl = `${cleanBaseUrl}/api/calls?limit=3000`;

    console.log(`📡 Buscando detalhe do ID ${id} através de: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      next: { revalidate: 0 }, // Garante que não pegue cache de erros anteriores
    });

    if (!response.ok) {
      return NextResponse.json({ debug: "O Render falhou ao responder", status: response.status }, { status: 502 });
    }

    const data = await response.json();

    // 🚩 TRATAMENTO DE ERRO DE COTA (Firebase RESOURCE_EXHAUSTED)
    // Se o backend retornar erro de cota, repassamos para o Front não quebrar tentando dar .find()
    if (data && data.error && (data.error.includes('RESOURCE_EXHAUSTED') || data.success === false)) {
      console.error("🚨 Erro de cota detectado ao buscar detalhes:", data.error);
      return NextResponse.json(data, { status: 429 });
    }

    const calls = Array.isArray(data) ? data : (data.calls || []);

    // Procura a chamada específica pelo ID ou callId
    const found = calls.find((c: any) => 
      String(c?.id) === String(id) || String(c?.callId) === String(id)
    );

    if (!found) {
      console.warn(`⚠️ Ligação com ID ${id} não encontrada na lista.`);
      return NextResponse.json({ debug: "Chamada não encontrada", id_buscado: id }, { status: 404 });
    }

    // Retorna apenas a ligação encontrada para o componente de detalhes
    console.log(`✅ Detalhe da call ${id} entregue com sucesso.`);
    return NextResponse.json(found);

  } catch (error: any) {
    console.error("❌ Erro fatal na rota de DETALHE:", error.message);
    return NextResponse.json({ 
      debug: "Erro interno na rota de DETALHE do Frontend",
      mensagem: error.message 
    }, { status: 500 });
  }
}