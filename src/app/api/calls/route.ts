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

  // Mantemos as duas opções de rota. 
  // Nota: Baseado no seu calls.ts, a rota correta é /api/calls.
  const endpoints = [
    `${cleanBaseUrl}/api/calls?${query}`,
    `${cleanBaseUrl}/calls?${query}`
  ];

  for (const url of endpoints) {
    try {
      console.log(`📡 Dashboard solicitando dados em: ${url}`);
      const res = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.WEBHOOK_SECRET || '' 
        },
        next: { revalidate: 0 }
      });

      // Se a resposta não for ok (tipo um 404), tentamos o próximo endpoint
      if (!res.ok) {
        console.warn(`⚠️ Endpoint ${url} retornou status ${res.status}`);
        continue;
      }

      const data = await res.json();

      // 🚩 AJUSTE CRÍTICO: 
      // Se o backend retornou um objeto de erro (como o RESOURCE_EXHAUSTED do Firebase),
      // repassamos ele para o Front saber que a cota estourou.
      if (data && data.error && (data.error.includes('RESOURCE_EXHAUSTED') || data.success === false)) {
        console.error(`🚨 Erro de Cota ou Backend detectado em ${url}:`, data.error);
        return NextResponse.json(data, { status: 429 }); 
      }

      // Se chegamos aqui, os dados são válidos (provavelmente um array de ligações)
      console.log(`✅ Sucesso! Dados recebidos de ${url}`);
      return NextResponse.json(data);
      
    } catch (err: any) {
      console.error(`❌ Falha de rede/conexão em ${url}:`, err.message);
    }
  }

  // Se nenhum endpoint funcionou ou retornou dados
  return NextResponse.json(
    { error: 'O servidor Render não retornou dados válidos. Verifique a cota do Firebase.' }, 
    { status: 502 }
  );
}