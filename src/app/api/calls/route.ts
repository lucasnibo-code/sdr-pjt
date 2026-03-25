import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return NextResponse.json({ error: 'URL da API ausente' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  // Tenta os dois caminhos possíveis (com e sem prefixo /api)
  const endpoints = [
    `${baseUrl.replace(/\/$/, '')}/api/calls?${query}`,
    `${baseUrl.replace(/\/$/, '')}/calls?${query}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 0 }
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.error(`Falha no endpoint: ${url}`);
    }
  }

  return NextResponse.json({ error: 'Servidor Render não respondeu' }, { status: 502 });
}