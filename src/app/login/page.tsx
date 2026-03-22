"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { NiboLogo } from '@/components/ui/nibo-logo';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const loginUrl = `${apiBaseUrl}/auth/google`;

    console.log('[DEBUG] Iniciando fluxo de login');
    console.log('[DEBUG] NEXT_PUBLIC_API_BASE_URL:', apiBaseUrl);
    console.log('[DEBUG] URL de redirecionamento final:', loginUrl);

    if (!apiBaseUrl) {
      console.error('[ERROR] NEXT_PUBLIC_API_BASE_URL não está definida no ambiente.');
      alert('Erro de configuração: URL da API não encontrada.');
      return;
    }

    // Tenta redirecionar
    try {
      window.open(loginUrl, '_self');
    } catch (error) {
      console.error('[ERROR] Falha ao redirecionar para o Google Login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
        <div className="text-center flex flex-col items-center">
          <NiboLogo className="text-2xl" />
        </div>

        <Card className="border-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Acesso</CardTitle>
            <CardDescription className="text-xs">
              Utilize sua conta Google corporativa.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] h-10"
            >
              Conectar com Google
            </Button>

            <div className="pt-4 space-y-2">
              <p className="text-[9px] text-slate-400 uppercase font-bold text-center">Links de Diagnóstico</p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`}
                className="block w-full text-center text-[10px] text-slate-500 underline hover:text-slate-900"
              >
                Link direto: /auth/google
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`}
                target="_blank"
                className="block w-full text-center text-[10px] text-slate-500 underline hover:text-slate-900"
              >
                Verificar Sessão Atual: /auth/me
              </a>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            Ambiente Corporativo Restrito
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
