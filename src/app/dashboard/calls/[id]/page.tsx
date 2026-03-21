"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  Clock,
  Calendar,
  User,
  ShieldAlert,
  Trophy,
  Target,
  Lightbulb,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SDRCall, StatusFinal } from '@/types';
import { cn } from '@/lib/utils';

export default function CallDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [call, setCall] = useState<SDRCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/calls')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar dados');
        return res.json();
      })
      .then(data => {
        const found = data.find((c: SDRCall) => c.id === id);
        if (!found) {
          setError('Chamada não encontrada.');
        } else {
          setCall(found);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Erro ao carregar os detalhes da chamada.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const getStatusConfig = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", label: "Aprovado" };
      case 'ATENCAO': return { icon: <AlertTriangle className="w-4 h-4" />, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", label: "Atenção" };
      case 'REPROVADO': return { icon: <XCircle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "Reprovado" };
      default: return { icon: <Zap className="w-4 h-4" />, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-100", label: "Não Identificado" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando análise...</p>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-sm text-red-500 font-medium">{error || 'Chamada não encontrada'}</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/calls')}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  const status = getStatusConfig(call.status_final);
  const formattedDate = call.analyzedAt ? new Date(call.analyzedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : 'Data não disponível';
  const durationMin = (call.durationMs / 60000).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/calls')}
          className="w-fit -ml-2 text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para histórico
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
                {call.title || 'Chamada sem Título'}
              </h1>
              <Badge className={cn("px-2.5 py-0.5 border shadow-none", status.bg, status.color, status.border)}>
                {status.icon} <span className="ml-1.5 font-bold uppercase tracking-wider text-[10px]">{status.label}</span>
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 text-sm">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> <span className="font-semibold text-slate-600">{call.ownerName}</span></span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {durationMin} min</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formattedDate}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Nota SPIN</span>
            <span className="text-4xl font-headline font-bold text-slate-900">{call.nota_spin.toFixed(1)}</span>
            <span className="text-[10px] text-slate-300 font-medium mt-1">de 10.0</span>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Resumo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Resumo da Análise</h3>
          </div>
          <Card className="border-slate-100 shadow-none bg-slate-50/30">
            <CardContent className="p-6">
              <p className="text-slate-600 leading-relaxed text-sm italic">
                "{call.resumo}"
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Alertas e Dificuldades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Alertas Críticos</h3>
            </div>
            <div className="space-y-3">
              {call.alertas && call.alertas.length > 0 ? (
                call.alertas.map((alerta, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-red-50/50 border border-red-100 rounded-lg text-red-800 text-xs">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                    {alerta}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">Nenhum alerta crítico identificado.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Target className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Maior Dificuldade</h3>
            </div>
            <Card className="border-slate-100 shadow-none">
              <CardContent className="p-5">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {call.maior_dificuldade || "Não identificada especificamente."}
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Pontos Fortes e Insight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Trophy className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Pontos Fortes</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {call.pontos_fortes && call.pontos_fortes.length > 0 ? (
                call.pontos_fortes.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50/50 border border-green-100 rounded-lg text-green-800 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    {p}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">Nenhum ponto forte destacado.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Foco de Melhoria</h3>
            </div>
            <div className="p-5 border-l-2 border-slate-900 bg-slate-50 rounded-r-lg">
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                {call.ponto_atencao}
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
