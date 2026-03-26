"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PhoneCall, 
  TrendingUp, 
  Calendar, 
  ArrowDownUp, 
  PhoneIncoming,
  Hourglass,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { SDRCall, DashboardSummary } from '@/types';

type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';

export default function SDRDetailPage() {
  // 🚩 O parâmetro da sua pasta no plural é [name]
  const { name } = useParams(); 
  const router = useRouter();
  const decodedName = decodeURIComponent(name as string);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [timeFilter, setTimeFilter] = useState('today'); 
  const [sortOrder, setSortOrder] = useState('score_desc');
  
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      
      // 1. BUSCA O RESUMO NO COFRE
      let summaryUrl = `/api/stats/summary?t=${timestamp}&period=${timeFilter}`;
      if (timeFilter === 'custom' && customStartDate && customEndDate) {
        summaryUrl += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const resSummary = await fetch(summaryUrl);
      if (resSummary.ok) {
        const summaryData = await resSummary.json();
        setSummary(summaryData);
      }

      // 2. BUSCA AS ÚLTIMAS 20 DESTE SDR (Filtro no Backend)
      let callsUrl = `/api/calls?ownerName=${encodeURIComponent(decodedName)}&limit=20&t=${timestamp}`;
      if (timeFilter === 'custom' && customStartDate && customEndDate) {
        callsUrl += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else {
        callsUrl += `&period=${timeFilter}`;
      }

      const resCalls = await fetch(callsUrl);
      if (resCalls.ok) {
        const callsData = await resCalls.json();
        setCalls(Array.isArray(callsData) ? callsData : []);
      }

    } catch (error) {
      console.error("Erro ao carregar perfil do SDR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (decodedName) fetchData();
  }, [decodedName, timeFilter]);

  // 🚩 Lógica de exibição blindada (Não quebra se o Cofre falhar ou der 404)
  const sdrStats = useMemo(() => {
    const stats = summary?.sdr_ranking?.[decodedName];

    if (!stats) {
      return { total: 0, valid: 0, avg: 0 };
    }

    return {
      total: stats.total || 0,
      valid: stats.valid_count || 0,
      avg: (stats.valid_count && stats.valid_count > 0) 
        ? (stats.sum_notes / stats.valid_count) 
        : 0
    };
  }, [summary, decodedName]);

  const sortedCalls = useMemo(() => {
    return [...calls].sort((a, b) => {
      if (sortOrder === 'score_desc') return (Number(b.nota_spin) || 0) - (Number(a.nota_spin) || 0);
      if (sortOrder === 'score_asc') return (Number(a.nota_spin) || 0) - (Number(b.nota_spin) || 0);
      return 0; 
    });
  }, [calls, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acessando Cofre do SDR...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="w-fit -ml-2 text-slate-400 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Dashboard
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-2xl font-bold text-slate-300">
              {getInitials(decodedName)}
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{decodedName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">SDR Ativo no Período</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Média SPIN
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">
                {sdrStats.avg > 0 ? sdrStats.avg.toFixed(1) : "--"}
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-slate-300" /> Tentativas
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{sdrStats.total}</span>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <PhoneIncoming className="w-3 h-3 text-indigo-500" /> Produtivas
              </span>
              <span className="text-2xl font-headline font-bold text-indigo-700">{sdrStats.valid}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          Últimas Atividades 
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">
            {calls.length} exibidas
          </span>
        </h3>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 h-9 shadow-sm">
             <ArrowDownUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
             <select 
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as SortOrder)}
               className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 cursor-pointer"
             >
               <option value="score_desc">Melhores Notas</option>
               <option value="score_asc">Menores Notas</option>
               <option value="date_desc">Mais Recentes</option>
             </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="month">Mês atual</option>
              <option value="all">Todo Histórico</option>
              <option value="custom">Personalizado...</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Barreira de Performance Ativa</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Para economizar cota do Firebase, exibimos as 20 chamadas mais recentes. 
            Os totais superiores refletem o volume real de {sdrStats.total} chamadas.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {sortedCalls.length > 0 ? (
          sortedCalls.map(call => (
            <CallCard key={call.id} call={call} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 gap-3">
            <Hourglass className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400 italic font-medium">Nenhum rastro encontrado para este SDR.</p>
          </div>
        )}
      </div>
    </div>
  );
}