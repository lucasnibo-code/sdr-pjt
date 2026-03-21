"use client";

import { useState, useEffect } from 'react';
import { 
  Inbox, 
  Loader2,
  RefreshCcw,
  Search
} from 'lucide-react';
import { CallCard } from '@/components/dashboard/CallCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SDRCall } from '@/types';

export default function DashboardPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calls');
      if (!res.ok) throw new Error('Falha ao carregar chamadas');
      const data = await res.json();
      
      // Ordenar por analyzedAt (mais recentes primeiro)
      const sortedData = (data as SDRCall[]).sort((a, b) => {
        const dateA = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
        const dateB = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setCalls(sortedData);
    } catch (err) {
      setError('Não foi possível carregar os dados. Verifique a conexão com a API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const filteredCalls = calls.filter(call => 
    call.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold text-slate-900">Análises de Chamadas</h1>
          <p className="text-slate-400 text-sm">Feed cronológico das avaliações realizadas pela IA.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchCalls}
          disabled={isLoading}
          className="h-9 text-xs font-semibold"
        >
          <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
        <Input 
          placeholder="Filtrar por título ou SDR..." 
          className="pl-9 bg-white border-slate-100 focus:border-slate-300 transition-all h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-200" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizando análises...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-50 bg-red-50/20 rounded-xl text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <Button variant="ghost" className="mt-4 text-xs" onClick={fetchCalls}>Tentar novamente</Button>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-slate-50 rounded-full">
            <Inbox className="w-6 h-6 text-slate-200" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">Nenhuma chamada encontrada</h2>
            <p className="text-xs text-slate-400">As novas análises aparecerão aqui automaticamente.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCalls.map(call => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}
