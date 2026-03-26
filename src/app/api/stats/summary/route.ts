import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      console.error("❌ Erro: NEXT_PUBLIC_API_BASE_URL não definida.");
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    // 🚩 Aponta para a rota de estatísticas no seu servidor Render
    let targetUrl = `${cleanBaseUrl}/api/stats/summary?period=${period}`;
    
    if (startDate && endDate) {
      targetUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    console.log(`📡 Buscando Resumo: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("❌ Erro no Render ao buscar resumo:", errorMsg);
      return NextResponse.json({ error: "Erro no servidor de estatísticas" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro na Rota Proxy Summary:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}