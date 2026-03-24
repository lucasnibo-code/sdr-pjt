"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
import { calculateAverageSpin } from '@/lib/metrics';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PhoneCall, 
  TrendingUp, 
  Calendar, 
  ArrowDownUp, 
  PhoneIncoming 
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { SDRCall } from '@/types';

type TimeFilter = 'today' | '7days' | '30days' | 'all';
type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';

export default function SDRDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const decodedName = decodeURIComponent(name as string);
  const DURATION_LIMIT = 120000; // Trava de 2 minutos

  const [allCalls, setAllCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        const sdrCalls = (data as SDRCall[]).filter((c) => c.ownerName === decodedName);
        setAllCalls(sdrCalls);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [decodedName]);

  // Lógica de Filtro e Separação de Métricas
  const processedData = useMemo(() => {
    const now = new Date();
    
    // 1. Filtro de Tempo (Baseado em todas as chamadas)
    const timeFiltered = allCalls.filter(call => {
      if (!call.analyzedAt || timeFilter === 'all') return true;
      const callDate = new Date(call.analyzedAt);
      const diffDays = Math.ceil(Math.abs(now.getTime() - callDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeFilter === 'today') return diffDays <= 1;
      if (timeFilter === '7days') return diffDays <= 7;
      if (timeFilter === '30days') return diffDays <= 30;
      return true;
    });

    // 2. Separação: Tentativas vs Analisadas (Conectadas)
    // Tentativas: Tudo o que passou no filtro de tempo
    const attempts = timeFiltered;
    
    // Conectadas/Analisadas: Só as que têm mais de 2 minutos
    const validCalls = timeFiltered.filter(c => (c.durationMs || 0) >= DURATION_LIMIT);

    // 3. Ordenação apenas do que vai para o relatório (validCalls)
    const displayCalls = [...validCalls].sort((a, b) => {
      if (sortOrder === 'score_desc') return (b.nota_spin || 0) - (a.nota_spin || 0);
      if (sortOrder === 'score_asc') return (a.nota_spin || 0) - (b.nota_spin || 0);
      const dateA = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
      const dateB = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
      return dateB - dateA;
    });

    return {
      attemptsCount: attempts.length,
      connectedCount: validCalls.length,
      displayCalls,
      avgSpin: calculateAverageSpin(validCalls)
    };
  }, [allCalls, timeFilter, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando Perfil...</p>
      </div>
    );
  }

  const initials = getInitials(decodedName);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/sdrs')} className="w-fit -ml-2 text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para SDRs
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-2xl font-bold text-slate-300">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900">{decodedName}</h1>
              <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                {allCalls[0]?.teamName || 'Equipe Geral'}
              </p>
            </div>
          </div>

          {/* DASHBOARD DE MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Média Nota
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{processedData.avgSpin.toFixed(1)}</span>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-slate-300" /> Tentativas
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{processedData.attemptsCount}</span>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <PhoneIncoming className="w-3 h-3 text-indigo-500" /> Conectadas
              </span>
              <span className="text-2xl font-headline font-bold text-indigo-700">{processedData.connectedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* FILTROS E HISTÓRICO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          Histórico de Análises 
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">
            {processedData.displayCalls.length}
          </span>
        </h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="all">Todo Histórico</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <ArrowDownUp className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="text-sm font-bold text-slate-600 bg-transparent outline-none p-1.5"
            >
              <option value="date_desc">Data (Recente)</option>
              <option value="score_desc">Nota (Maior)</option>
              <option value="score_asc">Nota (Menor)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {processedData.displayCalls.length > 0 ? (
          processedData.displayCalls.map(call => (
            <CallCard key={call.id} call={call} />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <p className="text-sm text-slate-400 italic">Nenhuma análise produtiva (+2 min) neste período.</p>
          </div>
        )}
      </div>
    </div>
  );
}