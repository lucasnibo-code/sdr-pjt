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
    
    // 🚩 AJUSTE CRÍTICO: Agora pedimos apenas UM ID para o backend. 
    // Removemos o "limit=3000" que matava sua cota.
    const targetUrl = `${cleanBaseUrl}/api/calls/${id}`;

    console.log(`📡 Buscando DETALHE ÚNICO do ID ${id} em: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      next: { revalidate: 0 }, 
    });

    if (!response.ok) {
      // Se o backend disser que não achou (404), repassamos o erro limpo
      if (response.status === 404) {
        return NextResponse.json({ debug: "Chamada não encontrada no banco" }, { status: 404 });
      }
      return NextResponse.json({ debug: "O servidor de API falhou", status: response.status }, { status: 502 });
    }

    const data = await response.json();

    // 🚩 TRATAMENTO DE ERRO DE COTA
    if (data && data.error && data.error.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(data, { status: 429 });
    }

    // Como agora o backend já retorna o objeto direto (ou deveria), 
    // não precisamos mais do .find() pesado.
    const found = data.call || data; 

    console.log(`✅ Detalhe da call ${id} entregue com sucesso.`);
    return NextResponse.json(found);

  } catch (error: any) {
    console.error("❌ Erro fatal na rota de API de Detalhe:", error.message);
    return NextResponse.json({ 
      debug: "Erro interno no Proxy da API",
      mensagem: error.message 
    }, { status: 500 });
  }
}