
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mic2, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b bg-card">
        <div className="flex items-center gap-2 font-headline text-primary text-xl font-bold">
          <Mic2 className="w-6 h-6" />
          <span>SDR VoiceInsights</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Button asChild size="sm" variant="default">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-headline tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary">
                  Avaliação de Ligações SDR
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transforme suas gravações em insights acionáveis com transcrição e análise automática por IA.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/dashboard">Começar Agora</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">Saiba Mais</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/20 rounded-full text-primary">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-headline font-bold">Transcrição com IA</h3>
                <p className="text-muted-foreground">Converta áudio em texto instantaneamente com precisão líder de mercado.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/20 rounded-full text-primary">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-headline font-bold">Resumos Inteligentes</h3>
                <p className="text-muted-foreground">Identifique pontos-chave e o sentimento da ligação sem precisar ouvir tudo.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/20 rounded-full text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-headline font-bold">Dashboard de Performance</h3>
                <p className="text-muted-foreground">Acompanhe métricas de SDRs e evolua a qualidade das prospecções.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">© 2024 SDR VoiceInsights. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Termos de Serviço
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
