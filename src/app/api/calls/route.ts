import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("❌ Erro: NEXT_PUBLIC_API_BASE_URL não definida no Frontend.");
    return NextResponse.json({ error: 'URL da API ausente' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // O seu backend em express monta a rota dentro de '/api' (app.use('/api', router))
  // Portanto, a URL correta é exclusivamente esta:
  const url = `${cleanBaseUrl}/api/calls?${query}`;

  try {
    console.log(`📡 Dashboard solicitando dados em: ${url}`);
    const res = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || '' 
      },
      next: { revalidate: 0 } // Desativa cache do Next.js
    });

    // Tenta ler o corpo da resposta, mesmo que seja erro
    const responseText = await res.text();
    let data = null;
    try { data = responseText ? JSON.parse(responseText) : null; } catch (e) {}

    // SE O BACKEND RETORNOU ERRO (ex: 500 do Render)
    if (!res.ok) {
      console.error(`🚨 O Backend Render falhou com status ${res.status}:`, data || responseText);
      // REPASSA O ERRO EXATO PARA O FRONTEND
      return NextResponse.json(
        { error: 'Erro no servidor backend', details: data || responseText }, 
        { status: res.status }
      );
    }

    // Erros customizados do Firebase no body (ex: Cota)
    if (data && data.error && data.error.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(data, { status: 429 }); 
    }

    // Sucesso
    console.log(`✅ Sucesso! Dados recebidos de ${url}`);
    return NextResponse.json(data);
    
  } catch (err: any) {
    // Aqui cai se o Render estiver totalmente offline, não responder (timeout) ou URL errada
    console.error(`❌ Falha de rede/conexão em ${url}:`, err.message);
    return NextResponse.json(
      { error: 'Falha de comunicação com o Render. Servidor offline ou hibernando.', details: err.message }, 
      { status: 504 } // 504 Gateway Timeout
    );
  }
}