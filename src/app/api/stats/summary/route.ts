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
      return NextResponse.json({ error: "Configuração de API ausente" }, { status: 500 });
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    // 🚩 Aponta para a rota de estatísticas que o seu backend processa
    let targetUrl = `${cleanBaseUrl}/api/stats/summary?period=${period}`;
    
    if (startDate && endDate) {
      targetUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    console.log(`📡 Buscando resumo do Cofre em: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Cofre não encontrado ou erro no servidor" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro na rota do Cofre:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}