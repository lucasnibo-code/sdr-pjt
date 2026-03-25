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

  // Mantemos as duas opções de rota
  const endpoints = [
    `${cleanBaseUrl}/api/calls?${query}`,
    `${cleanBaseUrl}/calls?${query}`
  ];

  for (const url of endpoints) {
    try {
      console.log(`📡 Tentando Render em: ${url}`);
      const res = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.WEBHOOK_SECRET || '' 
        },
        next: { revalidate: 0 }
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Sucesso! Recebidos ${data.length} itens de ${url}`);
        return NextResponse.json(data);
      }
      
      console.warn(`⚠️ Endpoint ${url} retornou status ${res.status}`);
    } catch (err: any) {
      console.error(`❌ Falha de rede em ${url}:`, err.message);
    }
  }

  return NextResponse.json({ error: 'O servidor Render não retornou dados válidos.' }, { status: 502 });
}