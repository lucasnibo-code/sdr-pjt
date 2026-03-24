import Link from 'next/link';
import { Badge } from '@/components/ui/badge'; // Mantido, embora não esteja em uso no snippet
import { ChevronRight, Clock, Database, Radio, Hourglass } from 'lucide-react';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: SDRCall;
}

export function CallCard({ call }: CallCardProps) {
  // 🚩 ALTERAÇÃO: Lógica para determinar a nota a ser exibida e usada nas cores.
  // O estado "Cinza/Tentativa" agora é EXPLICITAMENTE definido por SKIPPED_FOR_AUDIT.
  const isSkippedForAudit = call.processingStatus === "SKIPPED_FOR_AUDIT";

  let finalDisplayNota: number | null = null;
  if (!isSkippedForAudit) {
      // Garante que a nota é um número válido (pode ser 0.0) se não for SKIPPED
      const potentialNota = Number(call.nota_spin);
      if (!isNaN(potentialNota)) {
          finalDisplayNota = potentialNota;
      }
  }

  // 🚩 ALTERAÇÃO: Lógica de cores atualizada.
  // O estado Cinza agora ocorre APENAS se `finalDisplayNota` for `null` (ou seja, SKIPPED_FOR_AUDIT ou sem nota válida).
  // Notas abaixo de 5 (incluindo 0.0) são Vermelho.
  const getStatusColor = (nota: number | null) => {
    if (nota === null) return "bg-slate-200"; // Cinza: Tentativa / Não analisado (SKIPPED_FOR_AUDIT ou nota inválida)
    if (nota >= 7) return "bg-green-500";     // Verde: Aprovado
    if (nota >= 5) return "bg-amber-500";     // Laranja: Atenção
    return "bg-red-500";                      // Vermelho: Reprovado (nota < 5, incluindo 0.0)
  };

  // 🚩 ALTERAÇÃO: Função formatDate aprimorada para lidar com o formato Firebase (_seconds)
  // e outros tipos de entrada de data de forma mais robusta.
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
    return `${minutes} min`;
  };

  return (
    <Link href={`/dashboard/calls/${call.id}`}>
      <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-4">
          {/* Barrinha lateral dinâmica */}
          <div className={cn(
            "w-1.5 h-10 rounded-full shrink-0 transition-colors", 
            getStatusColor(finalDisplayNota) // 🚩 ALTERAÇÃO: Usa a nova variável `finalDisplayNota`
          )} />
          
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
              {call.title || 'Chamada sem Título'}
            </h4>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-tight">
              <span className="font-bold text-slate-600">{call.ownerName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDuration(call.durationMs)}
              </span>
              {/* 🚩 ALTERAÇÃO: Passa a data mais relevante para o formatDate */}
              <span>{formatDate(call.analyzedAt || call.updatedAt || call.createdAt)}</span>
              <span className="flex items-center gap-1 opacity-60">
                {call.source === 'HUBSPOT' ? <Radio className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                {call.source || 'SISTEMA'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right min-w-[40px]">
            <div className={cn(
              "text-lg font-headline font-bold leading-none",
              // 🚩 ALTERAÇÃO: Lógica de cor do texto da nota para refletir `finalDisplayNota`
              finalDisplayNota === null ? "text-slate-300" :
              finalDisplayNota >= 7 ? "text-green-600" : 
              finalDisplayNota >= 5 ? "text-amber-600" : "text-red-600"
            )}>
              {/* 🚩 ALTERAÇÃO: Proteção final para renderizar "--" se a nota for nula */}
              {finalDisplayNota !== null ? finalDisplayNota.toFixed(1) : "--"}
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {/* 🚩 ALTERAÇÃO: Exibe ícone de Hourglass se não houver nota */}
              {finalDisplayNota !== null ? "SPIN" : <Hourglass className="w-2 h-2 mx-auto" />}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}