import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, Database, Radio } from 'lucide-react';
import type { SDRCall, StatusFinal } from '@/types';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: SDRCall;
}

export function CallCard({ call }: CallCardProps) {
  const getStatusColor = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return "bg-green-500";
      case 'ATENCAO': return "bg-amber-500";
      case 'REPROVADO': return "bg-red-500";
      default: return "bg-slate-300";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--/--';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  return (
    <Link href={`/dashboard/calls/${call.id}`}>
      <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className={cn("w-1.5 h-10 rounded-full shrink-0", getStatusColor(call.status_final))} />
          
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{call.title || 'Chamada sem Título'}</h4>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-tight">
              <span className="font-bold text-slate-600">{call.ownerName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(call.durationMs)}</span>
              <span>{formatDate(call.analyzedAt)}</span>
              <span className="flex items-center gap-1 opacity-60">
                {call.source === 'HUBSPOT' ? <Radio className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                {call.source}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-lg font-headline font-bold text-slate-900 leading-none">
              {call.nota_spin.toFixed(1)}
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">SPIN</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
