"use client";

import { useState, useEffect } from 'react';
import { SDRRanking } from '@/components/dashboard/SDRRanking';
import type { SDRCall } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SDRsPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        setCalls(data);
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
