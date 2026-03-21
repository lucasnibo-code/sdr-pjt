"use client";

import { useState, useEffect } from 'react';
import { SDRRanking } from '@/components/dashboard/SDRRanking';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold text-slate-900">Performance por SDR</h1>
        <p className="text-slate-400 text-sm mt-1">Ranking técnico baseado na média das notas SPIN.</p>
      </div>

      <SDRRanking calls={calls} />
    </div>
  );
}
