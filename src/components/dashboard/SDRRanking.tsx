
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSDRRanking } from '@/lib/metrics';
import type { SDRCall } from '@/types';
import { cn } from '@/lib/utils';

interface SDRRankingProps {
  calls: SDRCall[];
}

export function SDRRanking({ calls }: SDRRankingProps) {
  const ranking = getSDRRanking(calls);

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-slate-900" />
          RANKING SDR
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {ranking.map((sdr, index) => (
          <Link 
            key={sdr.name} 
            href={`/dashboard/sdrs/${encodeURIComponent(sdr.name)}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "text-xs font-bold w-5",
                index === 0 ? "text-slate-900" : "text-slate-300"
              )}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900">{sdr.name}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">{sdr.count} LIGAÇÕES</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{sdr.avgSpin}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">SPIN</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
