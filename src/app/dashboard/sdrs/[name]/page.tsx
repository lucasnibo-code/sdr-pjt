"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
// 🚩 Usando a nossa função global de filtro de tempo
import { calculateAverageSpin, isWithinPeriod } from '@/lib/metrics';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PhoneCall, 
  TrendingUp, 
  Calendar, 
  ArrowDownUp, 
  PhoneIncoming,
  Hourglass,
  RefreshCw
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { SDRCall } from '@/types';

type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';

export default function SDRDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const decodedName = decodeURIComponent(name as string);

  const [allCalls, setAllCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚩 PADRÕES ATUALIZADOS: 'today' e 'score_desc' (Maior Nota)
  const [timeFilter, setTimeFilter] = useState('today'); 
  const [sortOrder, setSortOrder] = useState<SortOrder>('score_desc');
  
  // 🚩 ESTADOS PARA O CALENDÁRIO CUSTOMIZADO
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchData = () => {
    setIsLoading(true);
    let url = `/api/calls?t=${Date.now()}`;
    
    // 🚩 SE FOR DATA CUSTOMIZADA, AVISA A API PARA FILTRAR NA ORIGEM
    if (timeFilter === 'custom' && customStartDate && customEndDate) {
      url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
    }

    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log("🔍 URL SDR:", decodedName);
        
        // Filtro de nome flexível para achar apenas as chamadas deste SDR
        const sdrCalls = (data as SDRCall[]).filter((c) => 
          c.ownerName?.trim().toLowerCase() === decodedName.trim().toLowerCase()
        );
        
        console.log("✅ Chamadas encontradas no Front para este SDR:", sdrCalls.length);
  
        setAllCalls(sdrCalls);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar chamadas:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [decodedName]);

  const processedData = useMemo(() => {
    // 1. FILTRO DE TEMPO (Utiliza a métrica global isWithinPeriod)
    const timeFiltered = allCalls.filter(call => {
      if (timeFilter === 'custom') {
        if (!customStartDate || !customEndDate) return true;
        return isWithinPeriod(call.updatedAt, { start: customStartDate, end: customEndDate });
      }
      
      // Adaptador para manter compatibilidade com as strings do select antigo
      const filterKey = timeFilter === '7days' ? '7d' : (timeFilter === '30days' ? 'month' : timeFilter);
      return isWithinPeriod(call.updatedAt, filterKey);
    });

    // 2. FILTRA AS VÁLIDAS PARA A MÉDIA
    const validCalls = timeFiltered.filter(c => 
      c.processingStatus === 'DONE' || (c.nota_spin !== null && c.nota_spin !== undefined && Number(c.nota_spin) >= 0 && c.processingStatus !== 'SKIPPED_FOR_AUDIT')
    );

    // 3. ORDENAÇÃO DO HISTÓRICO
    const displayCalls = [...validCalls].sort((a, b) => {
      if (sortOrder === 'score_desc') return (Number(b.nota_spin) || 0) - (Number(a.nota_spin) || 0);
      if (sortOrder === 'score_asc') return (Number(a.nota_spin) || 0) - (Number(b.nota_spin) || 0);
      
      const secA = a.updatedAt?._seconds || a.updatedAt?.seconds || 0;
      const secB = b.updatedAt?._seconds || b.updatedAt?.seconds || 0;
      return secB - secA;
    });

    return {
      attemptsCount: timeFiltered.length,
      connectedCount: validCalls.length,
      displayCalls,
      avgSpin: calculateAverageSpin(validCalls) 
    };
  }, [allCalls, timeFilter, sortOrder, customStartDate, customEndDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando métricas...</p>
      </div>
    );
  }

  const initials = getInitials(decodedName);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/sdrs')} className="w-fit -ml-2 text-slate-400 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para SDRs
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-2xl font-bold text-slate-300">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{decodedName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {allCalls[0]?.teamName || 'Equipe Ativa'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Média Nota
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">
                {processedData.connectedCount > 0 ? processedData.avgSpin.toFixed(1) : "--"}
              </span>
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          Histórico de Análises 
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">
            {processedData.displayCalls.length}
          </span>
        </h3>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* ORDENAÇÃO */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 h-9 shadow-sm">
             <ArrowDownUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
             <select 
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as SortOrder)}
               className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 cursor-pointer"
             >
               <option value="score_desc">Maior Nota</option>
               <option value="score_asc">Menor Nota</option>
               <option value="date_desc">Recentes</option>
             </select>
          </div>

          {/* FILTRO DE DATA */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Mês atual</option>
              <option value="all">Todo Histórico</option>
              <option value="custom">Personalizado...</option>
            </select>
          </div>

          {/* INPUTS CUSTOMIZADOS */}
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in zoom-in duration-200 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="h-7 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"/>
              <span className="text-slate-300 text-[10px] font-bold">ATÉ</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="h-7 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"/>
              <Button onClick={fetchData} variant="default" size="sm" className="h-7 rounded-lg px-3 bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {processedData.displayCalls.length > 0 ? (
          processedData.displayCalls.map(call => (
            <CallCard key={call.id} call={call} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 gap-3">
            <Hourglass className="w-8 h-8 text-slate-200 animate-pulse" />
            <p className="text-sm text-slate-400 italic font-medium">Nenhuma análise encontrada para este período.</p>
          </div>
        )}
      </div>
    </div>
  );
}