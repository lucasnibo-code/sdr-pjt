
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3 text-primary">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Mic2 className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">
            Avaliação SDR's
          </h1>
          <p className="text-muted-foreground text-lg">
            Plataforma inteligente de análise de performance.
          </p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 pt-8">
            <CardTitle className="text-center text-xl">Acesso ao Painel</CardTitle>
            <CardDescription className="text-center">
              Identifique-se para gerenciar as avaliações do time.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Button 
              asChild
              className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-100 shadow-sm transition-all hover:shadow-md"
            >
              <Link href="/dashboard" className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </Link>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <Button variant="ghost" asChild className="w-full text-muted-foreground hover:text-primary">
              <Link href="/dashboard">Acessar como Convidado</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground opacity-50">
          &copy; 2024 VoiceInsights • Inteligência em Vendas
        </p>
      </div>
    </div>
  );
}
