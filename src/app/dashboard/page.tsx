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
import { calculateAverageSpin, isWithinPeriod } from '@/lib/metrics';
import type { SDRCall } from '@/types';

type SortOrder = 'date_desc' | 'score_desc' | 'score_asc';

export default function DashboardPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚩 PADRÕES INICIAIS: Maior Nota e Hoje
  const [sortOrder, setSortOrder] = useState<SortOrder>('score_desc');
  const [dateFilter, setDateFilter] = useState('today');
  
  // 🚩 Estados da data customizada
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/calls?t=${Date.now()}`;
      
      // 🚩 Repassa datas para a API caso seja customizado
      if (dateFilter === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      setCalls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar chamadas:", error);
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedCalls = useMemo(() => {
    if (!Array.isArray(calls)) return [];

    // 1. Filtro de Período (Suportando customizado)
    let filtered = calls.filter(call => {
      if (dateFilter === 'custom') {
        if (!customStartDate || !customEndDate) return true;
        return isWithinPeriod(call.updatedAt, { start: customStartDate, end: customEndDate });
      }
      return isWithinPeriod(call.updatedAt, dateFilter);
    });

    // 2. Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(call => {
        const name = call.ownerName?.toLowerCase() || '';
        const title = call.title?.toLowerCase() || '';
        return name.includes(term) || title.includes(term);
      });
    }

    // 3. Ordenação robusta
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'score_desc') return (Number(b.nota_spin) || 0) - (Number(a.nota_spin) || 0);
      if (sortOrder === 'score_asc') return (Number(a.nota_spin) || 0) - (Number(b.nota_spin) || 0);
      
      const dateA = a.updatedAt?._seconds || a.updatedAt?.seconds || (typeof a.updatedAt === 'number' ? a.updatedAt / 1000 : 0);
      const dateB = b.updatedAt?._seconds || b.updatedAt?.seconds || (typeof b.updatedAt === 'number' ? b.updatedAt / 1000 : 0);
      
      return dateB - dateA;
    });
  }, [calls, searchTerm, sortOrder, dateFilter, customStartDate, customEndDate]);

  // MÉTRICAS GLOBAIS
  const analyzedCalls = processedCalls.filter(c => c.processingStatus === "DONE");
  const avgSpin = calculateAverageSpin(processedCalls);
  const totalCallsCount = processedCalls.length; 
  const activeSDRs = new Set(analyzedCalls.map(c => c.ownerName).filter(Boolean)).size;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sincronizando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Geral</h1>
          <p className="text-slate-400 text-sm mt-1">Visão consolidada de tentativas e análises produtivas.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período e Customizado */}
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center h-8">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="month">Mês atual</option>
                <option value="all">Todo o período</option>
                <option value="custom">Personalizado...</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 sm:ml-2 sm:pl-3 sm:border-l border-slate-100 animate-in zoom-in duration-200">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)} 
                  className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"
                />
                <span className="text-slate-300 text-[10px] font-bold">ATÉ</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={e => setCustomEndDate(e.target.value)} 
                  className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"
                />
              </div>
            )}
          </div>
          
          <Button onClick={fetchData} variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Média SPIN (Real)</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{avgSpin > 0 ? avgSpin.toFixed(1) : "--"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><PhoneCall className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tentativas Registradas</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{totalCallsCount}</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">{analyzedCalls.length} reuniões analisadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SDRs com Nota</p>
              <p className="text-3xl font-headline font-bold text-slate-900">{activeSDRs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ranking do Período</h3>
          <SDRRanking calls={processedCalls} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filtrar por SDR ou Título..." 
                className="pl-11 h-12 bg-white border-slate-100 rounded-xl shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-12 shadow-sm min-w-[200px]">
              <ArrowDownUp className="w-4 h-4 text-slate-400 mr-3" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-full"
              >
                <option value="score_desc">Maior Nota</option>
                <option value="score_asc">Menor Nota</option>
                <option value="date_desc">Recentes</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {processedCalls.length > 0 ? (
              processedCalls.map(call => <CallCard key={call.id} call={call} />)
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 italic">Nenhum rastro encontrado para os filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}