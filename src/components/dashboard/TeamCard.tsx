import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3, Target } from 'lucide-react';
import { calculateAverageSpin, getStatusCounts } from '@/lib/metrics';
import type { SDRCall } from '@/types';

interface TeamCardProps {
  teamName: string;
  calls: SDRCall[];
}

export function TeamCard({ teamName, calls }: TeamCardProps) {
  const avgSpin = calculateAverageSpin(calls);
  const statusCounts = getStatusCounts(calls);
  const sdrsCount = new Set(calls.map(c => c.ownerName)).size;

  return (
    <Card className="overflow-hidden border-primary/10">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {teamName}
          </CardTitle>
          <Badge variant="secondary">{calls.length} Calls</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Média SPIN
            </p>
            <p className="text-2xl font-bold text-primary">{avgSpin}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1 justify-end">
              <Target className="w-3 h-3" /> SDRs Ativos
            </p>
            <p className="text-2xl font-bold">{sdrsCount}</p>
          </div>
        </div>
        
        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${(statusCounts.APROVADO / calls.length) * 100}%` }}
          />
          <div 
            className="bg-yellow-500 h-full" 
            style={{ width: `${(statusCounts.ATENCAO / calls.length) * 100}%` }}
          />
          <div 
            className="bg-red-500 h-full" 
            style={{ width: `${(statusCounts.REPROVADO / calls.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{statusCounts.APROVADO} Aprov.</span>
          <span>{statusCounts.ATENCAO} Atenç.</span>
          <span>{statusCounts.REPROVADO} Reprov.</span>
        </div>
      </CardContent>
    </Card>
  );
}
