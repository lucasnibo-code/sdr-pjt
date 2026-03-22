"use client";

import { Button } from '@/components/ui/button';
import { NiboLogo } from '@/components/ui/nibo-logo';

export default function Home() {
  const login = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const loginUrl = `${apiBaseUrl}/auth/google`;

    console.log('API BASE URL:', apiBaseUrl);
    console.log('LOGIN URL:', loginUrl);

    if (!apiBaseUrl) {
      alert('NEXT_PUBLIC_API_BASE_URL não está definida no build do frontend.');
      return;
    }

    window.open(loginUrl, '_self');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm space-y-12 text-center animate-in fade-in duration-700">
        <div className="space-y-6 flex flex-col items-center">
          <div className="flex items-center justify-center">
            <NiboLogo className="text-3xl" />
          </div>

          <p className="text-slate-400 text-sm font-light">
            Plataforma de inteligência para gestão de performance SDR.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={login}
            variant="outline"
            className="w-full h-12 text-sm font-medium border-slate-100 hover:bg-slate-50 rounded-lg"
          >
            Acessar com Google
          </Button>

          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`}
            className="block text-center text-xs text-slate-500 underline"
          >
            Testar link direto do Google Login
          </a>

          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            Uso Corporativo Interno
          </p>
        </div>
      </div>
    </div>
  );
}