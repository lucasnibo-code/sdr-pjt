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

  // Estados
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
      .catch(() => {
        setIsLoading(false);
      });
  }, [decodedName]);

  // Lógica de Filtro de Tempo
  const filteredCalls = useMemo(() => {
    const now = new Date();
    return allCalls.filter(call => {
      if (!call.analyzedAt) return timeFilter === 'all';
      const callDate = new Date(call.analyzedAt);
      const diffTime = Math.abs(now.getTime() - callDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilter === 'today') return diffDays <= 1;
      if (timeFilter === '7days') return diffDays <= 7;
      if (timeFilter === '30days') return diffDays <= 30;
      return true; // all
    });
  }, [allCalls, timeFilter]);

  // Lógica de Ordenação
  const processedCalls = useMemo(() => {
    const items = [...filteredCalls];
    if (sortOrder === 'score_desc') {
      return items.sort((a, b) => (b.nota_spin || 0) - (a.nota_spin || 0));
    }
    if (sortOrder === 'score_asc') {
      return items.sort((a, b) => (a.nota_spin || 0) - (b.nota_spin || 0));
    }
    // Padrão: data_desc
    return items.sort((a, b) => 
      new Date(b.analyzedAt || 0).getTime() - new Date(a.analyzedAt || 0).getTime()
    );
  }, [filteredCalls, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando perfil...</p>
      </div>
    );
  }

  const avgSpin = calculateAverageSpin(processedCalls);
  const initials = getInitials(decodedName);
  
  // Cálculo de tentativas (Placeholder: Se não houver campo no JSON, mostramos baseado nas conectadas)
  // Futuramente, você pode puxar o campo 'attempts' direto da sua API
  const totalAttempts = processedCalls.reduce((acc, call) => acc + ( (call as any).attempts || 1), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/sdrs')}
          className="w-fit -ml-2 text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para SDRs
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-2xl font-bold text-slate-300 uppercase">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
                {decodedName}
              </h1>
              <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                {allCalls[0]?.teamName || 'Equipe Geral'}
              </p>
            </div>
          </div>

          {/* GRID DE MÉTRICAS - 3 COLUNAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Média Nota
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{avgSpin.toFixed(1)}</span>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <PhoneCall className="w-3 h-3 text-slate-400" /> Tentativas
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{totalAttempts}</span>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col items-center justify-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <PhoneIncoming className="w-3 h-3 text-indigo-500" /> Conectadas
              </span>
              <span className="text-2xl font-headline font-bold text-indigo-700">{processedCalls.length}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          Histórico de Análises <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">{processedCalls.length}</span>
        </h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filtro de Período */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 pr-4"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="all">Todo Histórico</option>
            </select>
          </div>

          {/* Filtro de Ordenação */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <ArrowDownUp className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 pr-4"
            >
              <option value="date_desc">Data (Recente)</option>
              <option value="score_desc">Nota (Maior)</option>
              <option value="score_asc">Nota (Menor)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {processedCalls.length > 0 ? (
          processedCalls.map(call => (
            <CallCard key={call.id} call={call} />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <p className="text-sm text-slate-400 italic">Nenhuma chamada encontrada neste período.</p>
          </div>
        )}
      </div>
    </div>
  );
}