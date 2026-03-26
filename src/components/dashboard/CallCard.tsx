"use client";

import Link from 'next/link';
import { ChevronRight, Clock, Database, Radio, Hourglass, MinusCircle } from 'lucide-react';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: SDRCall;
}

export function CallCard({ call }: CallCardProps) {
  // 🚩 Lógica para determinar o estado da análise
  const isSkipped = call.processingStatus === "SKIPPED_FOR_AUDIT" || call.processingStatus === "SKIPPED_SHORT_CALL";
  const isRotaC = call.status_final === "NAO_SE_APLICA";

  let finalDisplayNota: number | null = null;
  if (!isSkipped && !isRotaC) {
    const potentialNota = Number(call.nota_spin);
    if (!isNaN(potentialNota)) {
      finalDisplayNota = potentialNota;
    }
  }

  // 🚩 Lógica de cores: Cinza para descartes/não analisados, Vermelho para nota < 5
  const getStatusColor = (nota: number | null) => {
    if (isSkipped || isRotaC || nota === null) return "bg-slate-200"; // Cinza: Descarte ou Não analisado
    if (nota >= 7) return "bg-green-500";   // Verde: Aprovado
    if (nota >= 5) return "bg-amber-500";   // Laranja: Atenção
    return "bg-red-500";                    // Vermelho: Reprovado (inclui nota 0.0)
  };

  // 🚩 Formatador robusto para Firebase Timestamps
  const formatDate = (dateInput: any) => {
    if (!dateInput) return '--/--';
    const rawDate = dateInput?._seconds || dateInput?.seconds || dateInput;
    const seconds = typeof rawDate === 'number' ? rawDate : (rawDate?._seconds || rawDate?.seconds || null);
    
    let date: Date;
    if (seconds) {
      date = new Date(seconds * 1000);
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return '--/--';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '0 min';
    const minutes = Math.floor(Number(ms) / 60000);
    const seconds = Math.floor((Number(ms) % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <Link href={`/dashboard/calls/${call.id}`}>
      <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center gap-4">
          {/* Barrinha lateral dinâmica */}
          <div className={cn(
            "w-1.5 h-10 rounded-full shrink-0 transition-colors", 
            getStatusColor(finalDisplayNota)
          )} />
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {call.title || 'Chamada sem Título'}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              <span className="text-slate-600">{call.ownerName || 'Desconhecido'}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDuration(call.durationMs)}
              </span>
              <span>{formatDate(call.analyzedAt || call.updatedAt)}</span>
              <span className="flex items-center gap-1 opacity-60">
                {call.source === 'HUBSPOT' ? <Radio className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                {call.source || 'SISTEMA'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right min-w-[50px]">
            <div className={cn(
              "text-lg font-headline font-black leading-none",
              finalDisplayNota === null ? "text-slate-300" :
              finalDisplayNota >= 7 ? "text-green-600" : 
              finalDisplayNota >= 5 ? "text-amber-600" : "text-red-600"
            )}>
              {finalDisplayNota !== null ? finalDisplayNota.toFixed(1) : "--"}
            </div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {isRotaC ? (
                <span className="flex items-center gap-1 justify-end">ROTA C <MinusCircle className="w-2 h-2" /></span>
              ) : finalDisplayNota !== null ? (
                "SPIN"
              ) : (
                <Hourglass className="w-2.5 h-2.5 ml-auto" />
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}