import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SDRCardProps {
  name: string;
  avgSpin: number;
  callCount: number;
}

export function SDRCard({ name, avgSpin, callCount }: SDRCardProps) {
  const initials = getInitials(name);

  return (
    <Link href={`/dashboard/sdrs/${encodeURIComponent(name)}`}>
      <Card className="relative overflow-hidden hover:border-slate-200 transition-all group border-slate-100 shadow-none bg-white">
        {/* Destaque da Nota no canto superior direito */}
        <div className="absolute top-0 right-0 p-3">
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex flex-col items-center min-w-[45px] shadow-sm group-hover:bg-white transition-colors">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">SPIN</span>
            <span className="text-sm font-headline font-bold text-slate-900 leading-none">
              {avgSpin.toFixed(1)}
            </span>
          </div>
        </div>

        <CardContent className="pt-10 pb-6 flex flex-col items-center text-center">
          {/* Iniciais reduzidas e suavizadas */}
          <div className="w-10 h-10 rounded-full bg-slate-50/50 border border-slate-100 flex items-center justify-center mb-3 group-hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{initials}</span>
          </div>
          
          {/* Nome com protagonismo reduzido */}
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
            {name}
          </h3>
          
          {/* Quantidade de ligações discreta */}
          <p className="text-[9px] font-medium text-slate-300 mt-1 uppercase tracking-tight">
            {callCount} {callCount === 1 ? 'Ligação' : 'Ligações'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
