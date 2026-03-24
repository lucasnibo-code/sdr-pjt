"use client";

import { useState, useEffect, useMemo } from 'react';
import { SDRCard } from '@/components/dashboard/SDRCard';
import type { SDRCall } from '@/types';
import { Loader2, Users, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
// 🚩 PONTO DE ALTERAÇÃO: Importando a métrica que corrigimos no passo anterior
import { isWithinPeriod } from '@/lib/metrics'; 

export default function SDRsPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 🚩 PONTO DE ALTERAÇÃO: Adicionado timestamp (?t=...) para evitar que o navegador
    // mostre dados antigos do cache após você rodar os scripts de limpeza.
    fetch(`/api/calls?t=${Date.now()}`, { cache: 'no-store' })
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
  }, []);

  // Agrupamos as chamadas por SDR, respeitando o FILTRO DE PERÍODO e BUSCA
  const sdrGroups = useMemo(() => {
    const groups: Record<string, SDRCall[]> = {};
    
    calls.forEach(call => {
      // 🚩 PONTO DE ALTERAÇÃO: Agora o isWithinPeriod sabe ler _seconds e seconds
      // Isso garante que as chamadas limpas pelo script apareçam no filtro certo.
      if (!isWithinPeriod(call.updatedAt, period)) return;

      // Filtro de Busca por Nome
      const name = call.ownerName || "Não Identificado";
      if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return;

      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(call);
    });

    return groups;
  }, [calls, searchTerm, period]);

  const sdrNames = useMemo(() => Object.keys(sdrGroups).sort(), [sdrGroups]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Calculando performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Time de SDRs</h1>
          <p className="text-slate-400 text-sm">Clique no card para ver o histórico detalhado do profissional.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Busca por Nome */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar SDR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-indigo-100"
            />
          </div>

          {/* Seletor de Período */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] h-10 text-xs font-bold bg-white border-slate-200 rounded-xl shadow-sm">
              <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              {/* 🚩 PONTO DE ALTERAÇÃO: Ajustado para bater com o case '7days' do metrics */}
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Mês atual</SelectItem>
              <SelectItem value="all">Todo o histórico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sdrNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
          <Users className="w-10 h-10 text-slate-200 mb-4" />
          <p className="text-sm text-slate-400 italic">Nenhum registro encontrado para este período ou busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sdrNames.map((name) => (
            <Link 
              key={name} 
              href={`/dashboard/sdrs/${encodeURIComponent(name)}`}
              className="block active:scale-95 transition-transform"
            >
              {/* 🚩 PONTO DE ALTERAÇÃO: O SDRCard receberá todas as chamadas do período.
                  A lógica de mostrar nota ou "--" será decidida dentro do SDRCard
                  usando o metrics.ts que já corrigimos. */}
              <SDRCard 
                name={name} 
                calls={sdrGroups[name]} 
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}