"use client";

import { useState, useEffect, useMemo } from 'react';
import { SDRCard } from '@/components/dashboard/SDRCard';
import { getSDRRanking, isWithinPeriod } from '@/lib/metrics';
import type { SDRCall } from '@/types';
import { Loader2, Users, Calendar } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function SDRsPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        setCalls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setCalls([]);
        setIsLoading(false);
      });
  }, []);

  // Recalcula o ranking apenas para as chamadas que atendem ao período selecionado
  const filteredRanking = useMemo(() => {
    const periodFilteredCalls = calls.filter(call => 
      isWithinPeriod(call.analyzedAt, period)
    );
    return getSDRRanking(periodFilteredCalls);
  }, [calls, period]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculando performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold text-slate-900">Performance por SDR</h1>
          <p className="text-slate-400 text-sm">Visão consolidada da performance técnica de cada profissional.</p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] h-9 text-xs font-semibold bg-white border-slate-100 shadow-none">
            <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Mês atual</SelectItem>
            <SelectItem value="year">Ano atual</SelectItem>
            <SelectItem value="all">Todo o histórico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRanking.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-slate-50 rounded-full">
            <Users className="w-6 h-6 text-slate-200" />
          </div>
          <p className="text-xs text-slate-400">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRanking.map((sdr) => (
            <SDRCard 
              key={sdr.name} 
              name={sdr.name} 
              avgSpin={sdr.avgSpin} 
              callCount={sdr.count} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
