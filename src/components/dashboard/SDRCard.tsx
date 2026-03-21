import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials, cn } from '@/lib/utils';

interface SDRCardProps {
  name: string;
  avgSpin: number;
  callCount: number;
}

export function SDRCard({ name, avgSpin, callCount }: SDRCardProps) {
  const initials = getInitials(name);
  const isGood = avgSpin >= 6;

  return (
    <Link href={`/dashboard/sdrs/${encodeURIComponent(name)}`}>
      <Card className="relative overflow-hidden hover:border-slate-200 transition-all group border-slate-100 shadow-none bg-white">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
          
          {/* BLOCO DE NOTA - O MAIS IMPORTANTE */}
          <div className={cn(
            "w-24 h-24 rounded-2xl border flex flex-col items-center justify-center transition-colors shadow-sm",
            isGood 
              ? "bg-green-50/50 border-green-100 text-green-700" 
              : "bg-red-50/50 border-red-100 text-red-700"
          )}>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Nota SPIN</span>
            <span className="text-4xl font-headline font-bold leading-none tracking-tighter">
              {avgSpin.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {/* Iniciais discretas */}
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{initials}</span>
            </div>
            
            {/* Identificação suavizada */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] group-hover:text-slate-600 transition-colors">
                {name}
              </h3>
              <p className="text-[9px] font-medium text-slate-300 mt-0.5 uppercase tracking-tight">
                {callCount} {callCount === 1 ? 'Ligação' : 'Ligações'}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}
