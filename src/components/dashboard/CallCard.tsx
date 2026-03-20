import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
      case 'APROVADO': return { icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-green-100 text-green-700 border-green-200" };
      case 'ATENCAO': return { icon: <AlertCircle className="w-3 h-3" />, color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
      case 'REPROVADO': return { icon: <XCircle className="w-3 h-3" />, color: "bg-red-100 text-red-700 border-red-200" };
      default: return { icon: null, color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const status = getStatusConfig(call.status_final);

  return (
    <Link href={`/dashboard/calls/${call.id}`}>
      <Card className="hover:bg-accent/5 transition-colors group cursor-pointer border-border/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{call.title}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(call.durationMs / 60000).toFixed(1)} min
              </span>
              <span>•</span>
              <span>{new Date(call.analyzedAt || '').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{call.nota_spin}</div>
              <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", status.color)}>
                {status.icon} <span className="ml-1">{call.status_final}</span>
              </Badge>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
