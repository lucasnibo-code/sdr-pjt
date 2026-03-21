
"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PhoneCall, 
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Inbox,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateAverageSpin, getStatusCounts } from '@/lib/metrics';
import { SDRRanking } from '@/components/dashboard/SDRRanking';
import { CallCard } from '@/components/dashboard/CallCard';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        setCalls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setCalls([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Carregando métricas...</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in">
        <div className="p-6 bg-slate-50 rounded-full">
          <Inbox className="w-8 h-8 text-slate-200" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Nenhum dado encontrado</h2>
          <p className="text-sm text-slate-400 max-w-xs">As chamadas processadas aparecerão aqui automaticamente.</p>
        </div>
      </div>
    );
  }

  const avgSpin = calculateAverageSpin(calls);
  const statusCounts = getStatusCounts(calls);

  const metrics = [
    { label: 'Total Calls', value: calls.length, icon: <PhoneCall className="w-3.5 h-3.5" />, color: "text-slate-900" },
    { label: 'Nota SPIN', value: avgSpin, icon: <BarChart3 className="w-3.5 h-3.5" />, color: "text-slate-900" },
    { label: 'Aprovadas', value: statusCounts.APROVADO, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-600" },
    { label: 'Em Atenção', value: statusCounts.ATENCAO, icon: <AlertCircle className="w-3.5 h-3.5" />, color: "text-amber-600" },
    { label: 'Reprovadas', value: statusCounts.REPROVADO, icon: <XCircle className="w-3.5 h-3.5" />, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-12 max-w-6xl animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm">Resumo operacional e métricas de performance técnica.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="p-6 bg-white border border-slate-100 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              {m.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
            </div>
            <p className={cn("text-3xl font-headline font-bold", m.color)}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Avaliações Recentes
              </h3>
              <p className="text-xs text-slate-400">As últimas interações analisadas pela IA.</p>
            </div>
          </div>
          <div className="grid gap-4">
            {calls.slice(0, 5).map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <SDRRanking calls={calls} />
        </div>
      </div>
    </div>
  );
}
