import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Puxa a URL que você confirmou estar correta na Vercel
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      console.error("🚨 Erro: NEXT_PUBLIC_API_BASE_URL não configurada na Vercel.");
      return NextResponse.json({ error: "Configuração de API ausente" }, { status: 500 });
    }

    // Monta a URL de destino para o seu backend no Render
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    let targetUrl = `${cleanBaseUrl}/api/stats/summary?period=${period}`;
    
    // Se houver datas customizadas, anexa à URL
    if (startDate && endDate) {
      targetUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      // Garante que o Next.js não cacheie erro 404 antigo
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: "Erro na resposta do Render", details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro no Proxy Summary:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}