import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });

    const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/stats/summary?period=${period}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) return NextResponse.json({ error: "Erro no Render" }, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}