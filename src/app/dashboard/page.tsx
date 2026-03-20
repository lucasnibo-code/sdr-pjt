
"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { SDRCall, PerformanceMetric, StatusFinal } from '@/types';
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

  const getStatusIcon = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'ATENCAO': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'REPROVADO': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <ShieldCheck className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return "bg-green-100 text-green-700 border-green-200";
      case 'ATENCAO': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'REPROVADO': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const metrics: PerformanceMetric[] = [
    { label: 'Total de Ligações', value: calls.length, change: 12, trend: 'up' },
    { label: 'Média Nota SPIN', value: (calls.reduce((acc, c) => acc + c.nota_spin, 0) / (calls.length || 1)).toFixed(1), change: 0.5, trend: 'up' },
    { label: 'Taxa de Aprovação', value: `${((calls.filter(c => c.status_final === 'APROVADO').length / (calls.length || 1)) * 100).toFixed(0)}%`, change: 2, trend: 'up' },
    { label: 'Minutos Analisados', value: (calls.reduce((acc, c) => acc + c.durationMs, 0) / 60000).toFixed(0), change: 15, trend: 'up' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Painel VoiceInsights</h1>
        <p className="text-muted-foreground mt-1">Visão geral do desempenho e qualidade das chamadas SDR.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  metric.trend === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-2xl font-headline font-bold mt-2">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas Avaliações</CardTitle>
              <CardDescription>Ligações processadas recentemente.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/calls">Ver Todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : (
                calls.slice(0, 5).map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
                        getStatusColor(call.status_final)
                      )}>
                        {getStatusIcon(call.status_final)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{call.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-semibold">{call.ownerName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{call.teamName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{(call.durationMs / 60000).toFixed(1)} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nota SPIN</p>
                        <p className="text-lg font-bold text-primary">{call.nota_spin}</p>
                      </div>
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/dashboard/calls/${call.id}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top SDRs</CardTitle>
            <CardDescription>Melhor performance média de SPIN.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'João Silva', score: 8.5, count: 24 },
                { name: 'Maria Souza', score: 8.2, count: 18 },
                { name: 'Ricardo Oliveira', score: 7.9, count: 21 },
                { name: 'Sarah Wilson', score: 7.5, count: 15 },
              ].map((sdr, i) => (
                <div key={sdr.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm font-medium">{sdr.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{sdr.score}</p>
                    <p className="text-[10px] text-muted-foreground">{sdr.count} calls</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
