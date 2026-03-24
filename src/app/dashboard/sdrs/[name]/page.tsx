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
  PhoneIncoming,
  Hourglass
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

  const [allCalls, setAllCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');

  useEffect(() => {
    fetch(`/api/calls?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // 🚩 ADICIONE ESTAS DUAS LINHAS:
        console.log("🔍 Nome que vem da URL:", decodedName);
        console.log("📊 Exemplo de nome que vem do Banco:", data[0]?.ownerName);
        
        const sdrCalls = (data as SDRCall[]).filter((c) => c.ownerName === decodedName);
        
        // 🚩 ADICIONE ESTA LINHA TAMBÉM:
        console.log("✅ Chamadas filtradas para este SDR:", sdrCalls.length);
  
        setAllCalls(sdrCalls);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [decodedName]);

  const processedData = useMemo(() => {
    const now = new Date();
    
    // 1. Filtro de Tempo
    const timeFiltered = allCalls.filter(call => {
      // 🚩 PONTO DE ALTERAÇÃO: Lógica robusta para ler datas.
      // O Firebase Admin (nosso script) gera "_seconds", o Firebase Web gera "seconds".
      // Aqui garantimos que o filtro de tempo entenda os dois.
      const seconds = call.updatedAt?._seconds || call.updatedAt?.seconds || (typeof call.updatedAt === 'number' ? call.updatedAt / 1000 : null);
      
      if (!seconds || timeFilter === 'all') return true;
      
      const callDate = new Date(seconds * 1000);
      const diffDays = Math.ceil(Math.abs(now.getTime() - callDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeFilter === 'today') return diffDays <= 1;
      if (timeFilter === '7days') return diffDays <= 7;
      if (timeFilter === '30days') return diffDays <= 30;
      return true;
    });

    // 🚩 PONTO DE ALTERAÇÃO: Agora separamos por Status, não por tempo de duração.
    // "Tentativas" = Tudo o que caiu no filtro de tempo (inclusive os "lixos" que limpamos).
    const attempts = timeFiltered;
    
    // "Conectadas/Válidas" = APENAS o que marcamos como DONE no banco de dados.
    const validCalls = timeFiltered.filter(c => c.processingStatus === 'DONE');

    // 3. Ordenação do histórico
    const displayCalls = [...validCalls].sort((a, b) => {
      if (sortOrder === 'score_desc') return (b.nota_spin || 0) - (a.nota_spin || 0);
      if (sortOrder === 'score_asc') return (a.nota_spin || 0) - (b.nota_spin || 0);
      
      // Ordenação por data (Recente primeiro)
      const secA = a.updatedAt?._seconds || a.updatedAt?.seconds || 0;
      const secB = b.updatedAt?._seconds || b.updatedAt?.seconds || 0;
      return secB - secA;
    });

    return {
      attemptsCount: attempts.length,
      connectedCount: validCalls.length,
      displayCalls,
      // 🚩 PONTO DE ALTERAÇÃO: A média agora é calculada apenas sobre as chamadas DONE.
      avgSpin: calculateAverageSpin(validCalls) 
    };
  }, [allCalls, timeFilter, sortOrder]);

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
            {/* 🚩 PONTO DE ALTERAÇÃO: Verificação da Média.
                Se a média for 0 (porque não há chamadas DONE), mostramos "--".
                Isso remove o "0.0" injusto da tela. */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[130px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-amber-500" /> Média Nota
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">
                {processedData.avgSpin > 0 ? processedData.avgSpin.toFixed(1) : "--"}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 ml-2 text-slate-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none p-1.5 cursor-pointer"
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
              className="text-xs font-bold text-slate-600 bg-transparent outline-none p-1.5 cursor-pointer"
            >
              <option value="date_desc">Recente</option>
              <option value="score_desc">Maior Nota</option>
              <option value="score_asc">Menor Nota</option>
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
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 gap-3">
            <Hourglass className="w-8 h-8 text-slate-200 animate-pulse" />
            <p className="text-sm text-slate-400 italic">Nenhuma análise produtiva (+2 min) processada.</p>
          </div>
        )}
      </div>
    </div>
  );
}