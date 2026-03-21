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
      <Card className="relative overflow-hidden hover:border-slate-300 transition-all group border-slate-100 shadow-none bg-white">
        <Badge className="absolute top-3 right-3 bg-slate-900 text-white hover:bg-slate-900 shadow-none font-bold text-[10px] py-0.5 px-2">
          {avgSpin.toFixed(1)}
        </Badge>
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors">
            <span className="text-lg font-bold text-slate-400 uppercase tracking-wider">{initials}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-600 transition-colors">{name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {callCount} {callCount === 1 ? 'Ligação' : 'Ligações'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
