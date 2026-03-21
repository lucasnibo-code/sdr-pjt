
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { SDRCall, StatusFinal } from '@/types';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: SDRCall;
}

export function CallCard({ call }: CallCardProps) {
  const getStatusConfig = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO': return { icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case 'ATENCAO': return { icon: <AlertCircle className="w-3 h-3" />, color: "bg-amber-50 text-amber-700 border-amber-100" };
      case 'REPROVADO': return { icon: <XCircle className="w-3 h-3" />, color: "bg-rose-50 text-rose-700 border-rose-100" };
      default: return { icon: null, color: "bg-slate-50 text-slate-700 border-slate-100" };
    }
  };

  const status = getStatusConfig(call.status_final);

  return (
    <Link href={`/dashboard/calls/${call.id}`}>
      <div className="group bg-white border border-slate-100 p-5 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-900 group-hover:text-slate-900 transition-colors">{call.title}</h4>
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {(call.durationMs / 60000).toFixed(1)} min
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>{new Date(call.analyzedAt || '').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right space-y-1">
            <div className="text-xl font-bold text-slate-900">{call.nota_spin}</div>
            <div className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border inline-flex items-center gap-1", status.color)}>
              {status.icon} {call.status_final}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
