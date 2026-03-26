"use client";

import { useState, useEffect, useMemo } from 'react';
import { SDRCard } from '@/components/dashboard/SDRCard';
import type { SDRCall } from '@/types';
import { Loader2, Users, Calendar, Search, ArrowDownUp, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Importando as funções de métricas corretamente
import { isWithinPeriod, calculateAverageSpin } from '@/lib/metrics'; 

type SortOrder = 'score_desc' | 'score_asc' | 'name_asc';

export default function SDRsPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [period, setPeriod] = useState('today');
  const [sortOrder, setSortOrder] = useState<SortOrder>('score_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchData = () => {
    setIsLoading(true);
    let url = `/api/calls?t=${Date.now()}`;
    
    if (period === 'custom' && customStartDate && customEndDate) {
      url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
    }

    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setCalls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setCalls([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [period]); // Recarrega se o período mudar

  // 1. Agrupa as chamadas e aplica os filtros de busca e data
  const sdrGroups = useMemo(() => {
    const groups: Record<string, SDRCall[]> = {};
    
    calls.forEach(call => {
      // Filtro de Período
      if (period === 'custom') {
        if (customStartDate && customEndDate && !isWithinPeriod(call.updatedAt, { start: customStartDate, end: customEndDate })) {
          return;
        }
      } else if (!isWithinPeriod(call.updatedAt, period)) {
        return;
      }

      // Filtro de Busca por Nome
      const name = call.ownerName || "Não Identificado";
      if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return;

      if (!groups[name]) groups[name] = [];
      groups[name].push(call);
    });

    return groups;
  }, [calls, searchTerm, period, customStartDate, customEndDate]);

  // 2. Ordenação dos nomes dos SDRs
  const sdrNames = useMemo(() => {
    const names = Object.keys(sdrGroups);
    
    return names.sort((a, b) => {
      if (sortOrder === 'name_asc') return a.localeCompare(b);
      
      const callsA = sdrGroups[a].filter(c => c.processingStatus === 'DONE');
      const callsB = sdrGroups[b].filter(c => c.processingStatus === 'DONE');
      const avgA = calculateAverageSpin(callsA);
      const avgB = calculateAverageSpin(callsB);
      
      return sortOrder === 'score_desc' ? avgB - avgA : avgA - avgB;
    });
  }, [sdrGroups, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
          Calculando performance do time...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Time de SDRs</h1>
          <p className="text-slate-400 text-sm font-medium">Análise de performance individual baseada no período selecionado.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar SDR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-indigo-100"
            />
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-sm min-w-[160px]">
            <ArrowDownUp className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-full"
            >
              <option value="score_desc">Maior Nota</option>
              <option value="score_asc">Menor Nota</option>
              <option value="name_asc">Ordem Alfabética</option>
            </select>
          </div>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-10 text-xs font-bold bg-white border-slate-200 rounded-xl shadow-sm">
              <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Mês atual</SelectItem>
              <SelectItem value="all">Todo o histórico</SelectItem>
              <SelectItem value="custom">Personalizado...</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <div className="flex items-center gap-2 animate-in zoom-in duration-200 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"/>
              <span className="text-slate-300 text-[10px] font-bold">ATÉ</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"/>
              <Button onClick={fetchData} variant="default" size="sm" className="h-8 rounded-lg px-3 bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="w-3 h-3 text-white" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {sdrNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
          <Users className="w-10 h-10 text-slate-200 mb-4" />
          <p className="text-sm text-slate-400 italic">Nenhum SDR encontrado com estes filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sdrNames.map((name) => {
            // Prepara o objeto de stats para o SDRCard
            const sdrCalls = sdrGroups[name];
            const validCalls = sdrCalls.filter(c => c.status_final !== 'NAO_SE_APLICA');
            const stats = {
              total: sdrCalls.length,
              valid_count: validCalls.length,
              sum_notes: validCalls.reduce((acc, c) => acc + (Number(c.nota_spin) || 0), 0)
            };

            return (
              <SDRCard 
                key={name} 
                name={name} 
                stats={stats} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}