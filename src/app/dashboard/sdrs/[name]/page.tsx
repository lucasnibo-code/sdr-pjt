"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
import { calculateAverageSpin, getStatusCounts } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, PhoneCall, BarChart3 } from 'lucide-react';
import type { SDRCall } from '@/types';

export default function SDRDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const decodedName = decodeURIComponent(name as string);
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        const sdrCalls = data.filter((c: SDRCall) => c.ownerName === decodedName);
        setCalls(sdrCalls);
        setIsLoading(false);
      });
  }, [decodedName]);

  if (isLoading) return <div className="flex justify-center p-12">Carregando perfil do SDR...</div>;

  const avgSpin = calculateAverageSpin(calls);
  const statusCounts = getStatusCounts(calls);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <User className="w-8 h-8" />
            {decodedName}
          </h1>
          <p className="text-muted-foreground">{calls[0]?.teamName || 'SDR'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <PhoneCall className="w-3 h-3" /> Total de Chamadas
            </p>
            <p className="text-3xl font-bold mt-2">{calls.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <BarChart3 className="w-3 h-3" /> Média SPIN
            </p>
            <p className="text-3xl font-bold mt-2 text-primary">{avgSpin}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase">Taxa de Aprovação</p>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {((statusCounts.APROVADO / calls.length) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Histórico de Avaliações
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {calls.map(call => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      </div>
    </div>
  );
}
