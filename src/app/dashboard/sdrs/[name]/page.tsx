"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallCard } from '@/components/dashboard/CallCard';
import { calculateAverageSpin } from '@/lib/metrics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PhoneCall, TrendingUp } from 'lucide-react';
import { getInitials } from '@/lib/utils';
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
        const sdrCalls = (data as SDRCall[]).filter((c) => c.ownerName === decodedName);
        setCalls(sdrCalls);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [decodedName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando perfil...</p>
      </div>
    );
  }

  const avgSpin = calculateAverageSpin(calls);
  const initials = getInitials(decodedName);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/sdrs')}
          className="w-fit -ml-2 text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para SDRs
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-slate-300 uppercase tracking-wider">{initials}</span>
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
                {decodedName}
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                {calls[0]?.teamName || 'Equipe não identificada'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center min-w-[120px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3" /> Média Nota
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{avgSpin.toFixed(1)}</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center min-w-[120px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <PhoneCall className="w-3 h-3" /> Ligações
              </span>
              <span className="text-2xl font-headline font-bold text-slate-900">{calls.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Histórico de Análises
        </h3>
        <div className="grid gap-3">
          {calls.length > 0 ? (
            calls.map(call => (
              <CallCard key={call.id} call={call} />
            ))
          ) : (
            <p className="text-sm text-slate-400 italic">Nenhuma chamada encontrada para este SDR.</p>
          )}
        </div>
      </div>
    </div>
  );
}
