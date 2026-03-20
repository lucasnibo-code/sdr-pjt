
"use client";

import { useState, useEffect } from 'react';
import { SDRRanking } from '@/components/dashboard/SDRRanking';
import type { SDRCall } from '@/types';
import { Loader2, Trophy } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Trophy className="w-12 h-12 text-muted-foreground opacity-20" />
        <div>
          <h2 className="text-xl font-bold">Nenhum SDR rankeado</h2>
          <p className="text-muted-foreground">O ranking será exibido assim que houver chamadas analisadas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Ranking de Performance</h1>
        <p className="text-muted-foreground mt-1">Compare o desempenho técnico médio dos SDRs.</p>
      </div>

      <SDRRanking calls={calls} />
    </div>
  );
}
