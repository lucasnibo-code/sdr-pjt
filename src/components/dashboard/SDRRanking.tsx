import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking SDR (Média SPIN)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {ranking.map((sdr, index) => (
            <Link 
              key={sdr.name} 
              href={`/dashboard/sdrs/${encodeURIComponent(sdr.name)}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                  index === 0 ? "bg-yellow-100 text-yellow-700" : 
                  index === 1 ? "bg-gray-100 text-gray-700" :
                  index === 2 ? "bg-orange-100 text-orange-700" : "text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{sdr.name}</p>
                  <p className="text-[10px] text-muted-foreground">{sdr.count} ligações analisadas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{sdr.avgSpin}</p>
                  <Badge variant="outline" className="text-[8px] h-4 py-0 leading-none">Média</Badge>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
