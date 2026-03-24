"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SDRCardProps {
  name: string;
  calls: any[]; // Array de chamadas do SDR
}

export function SDRCard({ name, calls }: SDRCardProps) {
  // Configurações de limite
  const DURATION_LIMIT = 120000; // 2 minutos

  // 1. Filtramos apenas as chamadas que foram REALMENTE avaliadas pela IA
  const evaluatedCalls = useMemo(() => {
    return calls.filter(call => (call.durationMs || 0) >= DURATION_LIMIT);
  }, [calls]);

  // 2. Calculamos a média baseada APENAS nessas chamadas avaliadas
  const avgSpin = useMemo(() => {
    if (evaluatedCalls.length === 0) return 0;
    const totalScore = evaluatedCalls.reduce((acc, call) => acc + (call.nota_spin || 0), 0);
    return totalScore / evaluatedCalls.length;
  }, [evaluatedCalls]);

  // 3. Definimos a cor do card baseada na nota real
  const getScoreStyles = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const scoreStyle = getScoreStyles(avgSpin);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-md transition-all group">
      
      {/* Círculo/Box da Nota */}
      <div className={cn(
        "w-32 h-32 rounded-3xl border-2 flex flex-col items-center justify-center transition-colors mb-6",
        scoreStyle
      )}>
        <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Nota Spin</span>
        <span className="text-5xl font-black tabular-nums">
          {avgSpin.toFixed(1)}
        </span>
      </div>

      {/* Iniciais / Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-300 mb-4">
        {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
      </div>

      {/* Nome do SDR */}
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight text-center group-hover:text-indigo-600 transition-colors">
        {name}
      </h3>

      {/* Contagem de Chamadas */}
      <div className="mt-2 text-center">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
          {evaluatedCalls.length} {evaluatedCalls.length === 1 ? 'Ligação Avaliada' : 'Ligações Avaliadas'}
        </p>
        
        {/* Info extra para o gestor saber o volume total de tentativas */}
        {calls.length > evaluatedCalls.length && (
          <p className="text-[9px] text-slate-300 italic mt-1">
            {calls.length} tentativas totais
          </p>
        )}
      </div>
    </div>
  );
}