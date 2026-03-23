"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  PhoneCall, 
  Users, 
  Search, 
  Calendar, 
  RefreshCw,
  ArrowDownUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CallCard } from '@/components/dashboard/CallCard';
import { SDRSummaryCard } from '@/components/dashboard/SDRSummaryCard';
import { calculateAverageSpin } from '@/lib/metrics';
import type { SDRCall } from '@/types';

type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';

export default function DashboardPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [dateFilter, setDateFilter] = useState('current_month');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      setCalls(data);
    } catch (error) {
      console.error("Erro ao buscar chamadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de Processamento (Filtro de busca + Ordenação por nota/data)
  const processedCalls = useMemo(() => {
    let result = calls.filter(call => 
      call.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'score_desc') {
      result.sort((a, b) => (b.nota_spin || 0) - (a.nota_spin || 0));
    } else if (sortOrder === 'score_asc') {
      result.sort((a, b) => (a.nota_spin || 0) - (b.nota_spin || 0));
    } else {
      result.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    }

    return result;
  }, [calls, searchTerm, sortOrder]);

  // Cálculos para os Mini-Cards superiores
  const avgSpin = calculateAverageSpin(processedCalls);
  const totalCalls = processedCalls.length;
  const activeSDRs = new Set(processedCalls.map(c => c.ownerName)).size;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER E FILTROS DE TOPO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Análises de Chamadas</h1>
          <p className="text-slate-400 text-sm mt-1">Feed cronológico das avaliações realizadas pela IA.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filtro de Mês */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="current_month">Mês atual</option>
              <option value="last_month">Mês passado</option>
              <option value="all">Todo o período</option>
            </select>
          </div>

          <Button onClick={fetchData} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-900">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Média SPIN</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{avgSpin.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-900">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Ligações</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{totalCalls}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-900">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SDRs Ativos</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{activeSDRs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA PRINCIPAL: RANKING E LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* RANKING LATERAL (SDRs) */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Resumo por SDR</h3>
          <div className="flex flex-col gap-2">
            <SDRSummaryCard calls={processedCalls} />
          </div>
        </div>

        {/* LISTA DE CHAMADAS COM FILTRO E ORDENAÇÃO */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filtrar por título ou SDR..." 
                className="pl-11 h-12 bg-white border-slate-100 rounded-xl shadow-sm focus-visible:ring-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* NOVO: Filtro de Ordenação por Nota */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-12 shadow-sm min-w-[200px]">
              <ArrowDownUp className="w-4 h-4 text-slate-400 mr-3" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-full"
              >
                <option value="date_desc">Data (Recentes)</option>
                <option value="score_desc">Nota (Maior)</option>
                <option value="score_asc">Nota (Menor)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {processedCalls.length > 0 ? (
              processedCalls.map(call => (
                <CallCard key={call.id} call={call} />
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 italic">Nenhuma análise encontrada com esses filtros.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}