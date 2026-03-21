"use client";

import { useState, useEffect } from 'react';
import { SDRCard } from '@/components/dashboard/SDRCard';
import { getSDRRanking } from '@/lib/metrics';
import type { SDRCall } from '@/types';
import { Loader2, Users } from 'lucide-react';

export default function SDRsPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        setCalls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setCalls([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculando performance...</p>
      </div>
    );
  }

  const ranking = getSDRRanking(calls);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl font-headline font-bold text-slate-900">Performance por SDR</h1>
        <p className="text-slate-400 text-sm">Visão consolidada da performance técnica de cada profissional.</p>
      </div>

      {ranking.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-slate-50 rounded-full">
            <Users className="w-6 h-6 text-slate-200" />
          </div>
          <p className="text-xs text-slate-400">Nenhum SDR identificado nas chamadas atuais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ranking.map((sdr) => (
            <SDRCard 
              key={sdr.name} 
              name={sdr.name} 
              avgSpin={sdr.avgSpin} 
              callCount={sdr.count} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
