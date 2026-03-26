"use client";

import { 
  User, 
  TrendingUp, 
  Phone, 
  Target, 
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SDRRankingEntry } from '@/types';

interface SDRCardProps {
  name: string;
  stats: SDRRankingEntry;
  index?: number; // Para mostrar a posição no ranking (1º, 2º...)
}

export function SDRCard({ name, stats, index }: SDRCardProps) {
  // Cálculo da média vindo direto do Cofre
  const avgSpin = stats.valid_count > 0 ? (stats.sum_notes / stats.valid_count) : 0;
  
  // Taxa de Aproveitamento (Analisadas / Total)
  const conversionRate = stats.total > 0 
    ? Math.round((stats.valid_count / stats.total) * 100) 
    : 0;

  // Cores baseadas na nota
  const getPerformanceColor = (score: number) => {
    if (score >= 8) return "text-emerald-500 border-emerald-100 bg-emerald-50";
    if (score >= 5) return "text-amber-500 border-amber-100 bg-amber-50";
    return "text-rose-500 border-rose-100 bg-rose-50";
  };

  const perfStyle = getPerformanceColor(avgSpin);

  return (
    <Link 
      // 🚩 ROTA AJUSTADA: Agora aponta para /sdrs/ (plural) conforme sua pasta
      href={`/dashboard/sdrs/${encodeURIComponent(name)}`}
      className="block group"
    >
      <div className="bg-white border border-slate-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-100 group-hover:-translate-y-1">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Avatar / Posição */}
            <div className="relative">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <User className="w-6 h-6" />
              </div>
              {index !== undefined && (
                <div className={cn(
                  "absolute -top-2 -left-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border",
                  index === 0 ? "bg-amber-400 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-500"
                )}>
                  {index + 1}º
                </div>
              )}
            </div>

            {/* Info do SDR */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {name}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Phone className="w-3 h-3" /> {stats.total} chamadas
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <Target className="w-3 h-3" /> {conversionRate}% produtivo
                </span>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-black text-sm",
                perfStyle
              )}>
                <TrendingUp className="w-3.5 h-3.5" />
                {avgSpin > 0 ? avgSpin.toFixed(1) : "--"}
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Média Spin</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>

        </div>

        {/* Mini barra de progresso (Visual de performance) */}
        <div className="mt-4 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              avgSpin >= 8 ? "bg-emerald-400" : avgSpin >= 5 ? "bg-amber-400" : "bg-rose-400"
            )}
            style={{ width: `${(avgSpin / 10) * 100}%` }}
          />
        </div>
      </div>
    </Link>
  );
}