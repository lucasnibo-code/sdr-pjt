"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
import { calculateAverageSpin, getStatusCounts } from '@/lib/metrics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, PhoneCall, BarChart3, TrendingUp } from 'lucide-react';
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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando perfil...</p>
    </div>
  );

  const avgSpin = calculateAverageSpin(calls);
  const statusCounts = getStatusCounts(calls);
  const approvalRate = ((statusCounts.APROVADO / calls.length) * 100).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-400 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 flex items-center gap-3">
            {decodedName}
          </h1>
          <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mt-1">
            {calls[0]?.teamName || 'Equipe não identificada'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-100 shadow-none bg-white">
          <CardContent className="pt-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PhoneCall className="w-3 h-3" /> Volume total
            </p>
            <p className="text-3xl font-headline font-bold mt-2 text-slate-900">{calls.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-none bg-white">
          <CardContent className="pt-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-3 h-3" /> Média SPIN
            </p>
            <p className="text-3xl font-headline font-bold mt-2 text-slate-900">{avgSpin}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-none bg-white">
          <CardContent className="pt-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Taxa Aprovação
            </p>
            <p className="text-3xl font-headline font-bold mt-2 text-green-600">{approvalRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Histórico de Análises
        </h3>
        <div className="grid gap-3">
          {calls.map(call => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      </div>
    </div>
  );
}
