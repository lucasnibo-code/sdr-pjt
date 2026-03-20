
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  FileText, 
  Zap, 
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowLeft,
  Trophy,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { SDRCall, StatusFinal } from '@/types';
import { cn } from '@/lib/utils';

export default function CallDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [call, setCall] = useState<SDRCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: SDRCall) => c.id === id);
        setCall(found || null);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Carregando avaliação...</div>;
  if (!call) return <div className="text-center py-10">Chamada não encontrada.</div>;

  const getStatusConfig = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return { icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-100", label: "Aprovado" };
      case 'ATENCAO': return { icon: <AlertTriangle className="w-5 h-5" />, color: "text-yellow-600", bg: "bg-yellow-100", label: "Atenção" };
      case 'REPROVADO': return { icon: <XCircle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-100", label: "Reprovado" };
      default: return { icon: <Zap className="w-5 h-5" />, color: "text-gray-600", bg: "bg-gray-100", label: "Não Identificado" };
    }
  };

  const status = getStatusConfig(call.status_final);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline font-bold text-primary">{call.title}</h1>
              <Badge className={cn("border-none", status.bg, status.color)}>
                {status.icon} <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              SDR: <span className="font-semibold">{call.ownerName}</span> • Time: {call.teamName} • {(call.durationMs / 60000).toFixed(1)} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Áudio
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Audio & Summary Player */}
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <Button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white text-primary hover:bg-white/90 shrink-0" 
                  size="icon"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-bold">Resumo da Chamada</h3>
                  <p className="text-sm opacity-90 leading-relaxed italic">
                    "{call.resumo}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="insights">Análise Técnica</TabsTrigger>
              <TabsTrigger value="alerts">Alertas & Melhorias</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Pontos Fortes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {call.pontos_fortes.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        {p}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    Ponto de Atenção Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-blue-900 font-medium">{call.ponto_atencao}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas Críticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {call.alertas.map((alerta, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-3 border rounded-md border-red-100 bg-red-50/30">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        {alerta}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Maior Dificuldade do SDR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {call.maior_dificuldade}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* SPIN Score Card */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 text-center">
              <CardTitle className="text-lg uppercase tracking-widest text-primary">Nota SPIN</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center">
                <div className="text-6xl font-headline font-bold text-primary">
                  {call.nota_spin}
                </div>
                <p className="text-sm text-muted-foreground mt-2">de 10.0 pontos possíveis</p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <p className="text-xs font-bold text-muted-foreground uppercase">Desempenho por Etapa</p>
                {[
                  { label: 'Situação', score: 9 },
                  { label: 'Problema', score: 7 },
                  { label: 'Implicação', score: 6 },
                  { label: 'Necessidade', score: 8 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-bold">{item.score}/10</span>
                    </div>
                    <Progress value={item.score * 10} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meta Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadados da Chamada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da Chamada</span>
                <span className="font-mono">{call.callId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analisado em</span>
                <span>{new Date(call.analyzedAt || "").toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID do SDR</span>
                <span>{call.ownerUserId || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
