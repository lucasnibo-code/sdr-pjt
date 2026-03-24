"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Hourglass } from 'lucide-react'; // Ícone para o estado de espera

interface SDRCardProps {
  name: string;
  calls: any[]; 
}

export function SDRCard({ name, calls }: SDRCardProps) {
  // 1. Filtramos apenas o que a IA deu o "OK" final (Status DONE)
  const evaluatedCalls = useMemo(() => {
    return calls.filter(call => call.processingStatus === "DONE");
  }, [calls]);

  // 2. Calculamos a média (Se não houver chamadas, retornamos null para sinalizar o estado "Vazio")
  const avgSpin = useMemo(() => {
    if (evaluatedCalls.length === 0) return null;
    const totalScore = evaluatedCalls.reduce((acc, call) => acc + (call.nota_spin || 0), 0);
    return totalScore / evaluatedCalls.length;
  }, [evaluatedCalls]);

  // 3. Sistema de Cores Inteligente
  const getScoreStyles = (score: number | null) => {
    // ESTADO: Aguardando Análise (Cinza Neutro)
    if (score === null) return "text-slate-400 bg-slate-50 border-slate-100 opacity-60";
    
    // ESTADOS DE PERFORMANCE (Cores Ativas)
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const scoreStyle = getScoreStyles(avgSpin);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      
      {/* Box da Nota com Lógica de "Vazio" */}
      <div className={cn(
        "w-32 h-32 rounded-3xl border-2 flex flex-col items-center justify-center transition-colors mb-6",
        scoreStyle
      )}>
        <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
          {avgSpin === null ? "Aguardando" : "Nota Spin"}
        </span>
        <span className="text-5xl font-black tabular-nums">
          {avgSpin !== null ? avgSpin.toFixed(1) : "--"}
        </span>
      </div>

      {/* Iniciais / Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
        {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
      </div>

      {/* Nome do SDR */}
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight text-center group-hover:text-indigo-600 transition-colors">
        {name}
      </h3>

      {/* Contagem de Chamadas e Status */}
      <div className="mt-3 text-center space-y-1">
        {avgSpin !== null ? (
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-tighter">
            {evaluatedCalls.length} {evaluatedCalls.length === 1 ? 'Reunião Analisada' : 'Reuniões Analisadas'}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Hourglass className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Sem análises produtivas</span>
          </div>
        )}
        
        {/* Rastro de Auditoria (Sempre visível para o gestor ver o esforço) */}
        <p className="text-[9px] text-slate-300 font-medium italic">
          {calls.length} {calls.length === 1 ? 'tentativa registrada' : 'tentativas registradas'}
        </p>
      </div>

      {/* Badge Flutuante para "Top Performer" (Opcional, dá um toque premium) */}
      {avgSpin !== null && avgSpin >= 9 && (
        <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">
          Top Player
        </div>
      )}
    </div>
  );
}