"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Hourglass } from 'lucide-react'; 
// 🚩 PONTO DE ATENÇÃO: Importe o tipo se necessário, ou mantenha como any se o arquivo de tipos estiver longe
import type { SDRCall } from '@/types'; 

interface SDRCardProps {
  name: string;
  calls: SDRCall[]; 
}

export function SDRCard({ name, calls }: SDRCardProps) {
  // 🚩 PONTO DE ALTERAÇÃO: Filtro Crítico de Performance
  // Agora o Card ignora as chamadas curtas/com erro que limpamos no banco.
  // Ele só considera para a NOTA o que a IA carimbou como DONE.
  const evaluatedCalls = useMemo(() => {
    return (calls || []).filter(call => call.processingStatus === "DONE");
  }, [calls]);

  // 🚩 PONTO DE ALTERAÇÃO: Cálculo da Média Protegido
  // Se não houver chamadas DONE, retornamos null. Isso evita o "0.0" fantasma.
  const avgSpin = useMemo(() => {
    if (evaluatedCalls.length === 0) return null;
    const totalScore = evaluatedCalls.reduce((acc, call) => acc + (call.nota_spin || 0), 0);
    return totalScore / evaluatedCalls.length;
  }, [evaluatedCalls]);

  // 3. Sistema de Cores Inteligente
  const getScoreStyles = (score: number | null) => {
    // 🚩 ESTADO: Aguardando Análise (Cinza)
    // Se o score for null, o card fica "desativado" visualmente.
    if (score === null) return "text-slate-300 bg-slate-50/50 border-slate-100 opacity-70";
    
    // ESTADOS DE PERFORMANCE (Cores vivas apenas para dados reais)
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const scoreStyle = getScoreStyles(avgSpin);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      
      {/* Box da Nota com Lógica de "Vazio" */}
      <div className={cn(
        "w-32 h-32 rounded-3xl border-2 flex flex-col items-center justify-center transition-all mb-6",
        scoreStyle
      )}>
        <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
          {/* 🚩 PONTO DE ALTERAÇÃO: Label dinâmica */}
          {avgSpin === null ? "Aguardando" : "Média Spin"}
        </span>
        <span className="text-5xl font-black tabular-nums">
          {/* 🚩 PONTO DE ALTERAÇÃO: Exibição da nota ou traço */}
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
            {evaluatedCalls.length} {evaluatedCalls.length === 1 ? 'Análise Realizada' : 'Análises Realizadas'}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-slate-300">
            <Hourglass className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Sem análises produtivas</span>
          </div>
        )}
        
        {/* Rastro de Auditoria (Esforço Bruto) */}
        <p className="text-[9px] text-slate-300 font-medium italic">
          {calls.length} {calls.length === 1 ? 'tentativa registrada' : 'tentativas registradas'}
        </p>
      </div>

      {/* Badge Flutuante para "Top Performer" */}
      {avgSpin !== null && avgSpin >= 8.5 && (
        <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-lg animate-in zoom-in duration-300">
          Top Player
        </div>
      )}
    </div>
  );
}