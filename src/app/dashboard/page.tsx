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
import { SDRRanking } from '@/components/dashboard/SDRRanking';
import { calculateAverageSpin } from '@/lib/metrics';
import type { SDRCall } from '@/types';

type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';
type DateFilter = 'today' | '7days' | '30days' | 'all';

export default function DashboardPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');

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

  // Lógica de Processamento: FILTRO DE DATA + BUSCA + ORDENAÇÃO
  const processedCalls = useMemo(() => {
    const now = new Date();
    
    // 1. Filtro de Data Real
    let filtered = calls.filter(call => {
      if (dateFilter === 'all') return true;
      if (!call.analyzedAt) return false;
      
      const callDate = new Date(call.analyzedAt);
      const diffTime = Math.abs(now.getTime() - callDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today') return diffDays <= 1;
      if (dateFilter === '7days') return diffDays <= 7;
      if (dateFilter === '30days') return diffDays <= 30;
      return true;
    });

    // 2. Filtro de busca por nome/título
    let searched = filtered.filter(call => {
      const name = call.ownerName?.toLowerCase() || '';
      const title = call.title?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return name.includes(search) || title.includes(search);
    });

    // 3. Ordenação por Nota ou Data
    const sorted = [...searched].sort((a, b) => {
      if (sortOrder === 'score_desc') return (b.nota_spin || 0) - (a.nota_spin || 0);
      if (sortOrder === 'score_asc') return (a.nota_spin || 0) - (b.nota_spin || 0);
      
      const dateA = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
      const dateB = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
      return dateB - dateA;
    });

    return sorted;
  }, [calls, searchTerm, sortOrder, dateFilter]);

  const avgSpin = calculateAverageSpin(processedCalls);
  const totalCalls = processedCalls.length;
  const activeSDRs = new Set(processedCalls.map(c => c.ownerName)).size;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Análises de Chamadas</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão de performance baseada em Inteligência Artificial.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* SELETOR DE DATA REAL */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="all">Todo o período</option>
            </select>
          </div>

          <Button onClick={fetchData} variant="outline" className="rounded-xl border-slate-200">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Média SPIN (Período)</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{avgSpin.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Conectadas</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{totalCalls}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SDRs Analisados</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{activeSDRs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <SDRRanking calls={processedCalls} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filtrar por nome do SDR..." 
                className="pl-11 h-12 bg-white border-slate-100 rounded-xl shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-12 shadow-sm min-w-[210px]">
              <ArrowDownUp className="w-4 h-4 text-slate-400 mr-3" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none w-full"
              >
                <option value="date_desc">Mais recentes</option>
                <option value="score_desc">Maiores notas</option>
                <option value="score_asc">Menores notas (Coaching)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {processedCalls.map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}