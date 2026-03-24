import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, Database, Radio, Hourglass } from 'lucide-react';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: SDRCall;
}

export function CallCard({ call }: CallCardProps) {
  // 🚩 LÓGICA DE STATUS: Verifica se a chamada foi realmente analisada
  const isProcessed = call.processingStatus === "DONE" || (Number(call.nota_spin) > 0);
  const notaValida = isProcessed ? Number(call.nota_spin || 0) : null;

  // 🚩 CORES: Agora aceita o estado "Tentativa" (Cinza)
  const getStatusColor = (nota: number | null) => {
    if (nota === null) return "bg-slate-200"; // Tentativa / Aguardando
    if (nota >= 7) return "bg-green-500";     // Aprovado
    if (nota >= 5) return "bg-amber-500";     // Atenção
    return "bg-red-500";                      // Reprovado
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--/--';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch {
      return '--/--';
    }
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
            getStatusColor(notaValida)
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
              <span>{formatDate(call.analyzedAt)}</span>
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
              notaValida === null ? "text-slate-300" :
              notaValida >= 7 ? "text-green-600" : 
              notaValida >= 5 ? "text-amber-600" : "text-red-600"
            )}>
              {/* 🚩 PROTEÇÃO FINAL: Nunca quebra se nota for null */}
              {notaValida !== null ? notaValida.toFixed(1) : "--"}
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {notaValida !== null ? "SPIN" : <Hourglass className="w-2 h-2 mx-auto" />}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}