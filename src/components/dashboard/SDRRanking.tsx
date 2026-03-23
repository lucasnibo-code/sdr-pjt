"use client";

import { Trophy, ArrowRight, AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react';
import Link from 'next/link';
import { getSDRRanking } from '@/lib/metrics';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

interface SDRRankingProps {
  calls: SDRCall[];
}

export function SDRRanking({ calls }: SDRRankingProps) {
  // O ranking é calculado dinamicamente com base nas chamadas filtradas (mês/busca)
  const ranking = getSDRRanking(calls);

  // Função auxiliar para definir a cor e o ícone de status baseado na nota
  const getStatusConfig = (avg: number) => {
    if (avg >= 8) return { color: "text-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> };
    if (avg >= 5) return { color: "text-amber-500", bg: "bg-amber-50", icon: <MinusCircle className="w-3 h-3" /> };
    return { color: "text-rose-500", bg: "bg-rose-50", icon: <AlertCircle className="w-3 h-3" /> };
  };

  if (ranking.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-8 text-center">
        <p className="text-xs text-slate-400 italic">Nenhum dado para o ranking.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-50 bg-slate-50/30">
        <h3 className="text-[10px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-[0.15em]">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Ranking Performance
        </h3>
      </div>
      
      <div className="divide-y divide-slate-50">
        {ranking.map((sdr, index) => {
          const status = getStatusConfig(Number(sdr.avgSpin));
          
          return (
            <Link 
              key={sdr.name} 
              href={`/dashboard/sdrs/${encodeURIComponent(sdr.name)}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* Posição com destaque para o Top 3 */}
                <span className={cn(
                  "text-[10px] font-black w-5 text-center transition-colors",
                  index === 0 ? "text-amber-500" : 
                  index === 1 ? "text-slate-400" : 
                  index === 2 ? "text-amber-700" : "text-slate-200"
                )}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                
                <div>
                  <p className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {sdr.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {sdr.count} {sdr.count === 1 ? 'chamada' : 'chamadas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-xs mb-0.5",
                    status.color,
                    status.bg
                  )}>
                    {status.icon}
                    {Number(sdr.avgSpin).toFixed(1)}
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Nota Média</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Rodapé informativo */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
        <p className="text-[9px] text-slate-400 font-medium">
          Baseado nas chamadas do período selecionado
        </p>
      </div>
    </div>
  );
}