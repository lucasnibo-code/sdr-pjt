"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PhoneCall, 
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp
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
        setCalls(data);
        setIsLoading(false);
      });
  }, []);

  const avgSpin = calculateAverageSpin(calls);
  const statusCounts = getStatusCounts(calls);

  const metrics = [
    { label: 'Total Calls', value: calls.length, icon: <PhoneCall className="w-4 h-4" /> },
    { label: 'Média SPIN', value: avgSpin, icon: <BarChart3 className="w-4 h-4" />, color: "text-primary" },
    { label: 'Aprovadas', value: statusCounts.APROVADO, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600" },
    { label: 'Em Atenção', value: statusCounts.ATENCAO, icon: <AlertCircle className="w-4 h-4" />, color: "text-yellow-600" },
    { label: 'Reprovadas', value: statusCounts.REPROVADO, icon: <XCircle className="w-4 h-4" />, color: "text-red-600" },
  ];

  if (isLoading) return <div className="p-10 text-center">Carregando Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Resumo da Operação</h1>
        <p className="text-muted-foreground mt-1">Acompanhe as métricas de qualidade em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {m.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
              </div>
              <p className={cn("text-2xl font-headline font-bold", m.color)}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Avaliações Recentes
              </CardTitle>
              <CardDescription>Clique em uma chamada para ver o feedback detalhado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {calls.slice(0, 5).map(call => (
                <CallCard key={call.id} call={call} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SDRRanking calls={calls} />
        </div>
      </div>
    </div>
  );
}
