"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Target, PhoneCall, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- 1. TIPAGEM ESTRITA ---
// O que esperamos receber da API
interface API_SDRStats {
  nota_media?: string | number;
  calls?: string | number;
  valid_calls?: string | number;
}

// O formato final que o nosso componente vai renderizar
interface SDRRankingItem {
  name: string;
  nota: number;
  volume: number;
  validos: number;
}

export default function SDRsPage() {
  const [ranking, setRanking] = useState<SDRRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // --- 2. ESTADO DE ERRO RESTAURADO ---

  const fetchData = async () => {
    setIsLoading(true);
    setError(null); // Limpa erros antigos antes de tentar novamente

    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/stats/summary?period=month&t=${timestamp}`);
      const data = await res.json();

      // --- 3. VALIDAÇÃO DE ERRO DA API ---
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao carregar o ranking de SDRs. Tente novamente.');
      }

      if (data.sdr_ranking) {
        // Mapeia e transforma garantindo a tipagem correta
        const formattedRanking: SDRRankingItem[] = Object.entries(data.sdr_ranking)
          .map(([name, stats]) => {
            const typedStats = stats as API_SDRStats;
            return {
              name,
              nota: Number(typedStats.nota_media || 0),
              volume: Number(typedStats.calls || 0),
              validos: Number(typedStats.valid_calls || 0)
            };
          })
          .sort((a, b) => b.nota - a.nota);

        setRanking(formattedRanking);
      } else {
        setRanking([]); // Garante um array limpo se não vier o objeto sdr_ranking
      }
    } catch (err: any) {
      console.error("❌ Erro ao carregar SDRs:", err);
      setError(err.message || 'Erro inesperado de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Processando Consultores...</p>
      </div>
    );
  }

  // --- 4. TELA DE ERRO AMIGÁVEL RESTAURADA ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-headline font-bold text-slate-800">Problema de Conexão</h2>
        <p className="text-sm text-slate-500 text-center max-w-md bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          {error}
        </p>
        <Button onClick={fetchData} className="mt-4 bg-slate-900 hover:bg-slate-800 rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Equipe de Vendas</h1>
          <p className="text-slate-400 text-sm mt-1">Ranking e performance dos SDRs (Mês Atual).</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400 italic">Nenhum consultor registrou chamadas neste período.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ranking.map((sdr, index) => (
            <Card key={index} className="border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {getInitials(sdr.name)}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1 border-2 border-white">
                          <Trophy className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 line-clamp-1" title={sdr.name}>{sdr.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Consultor SDR</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-headline font-black text-slate-900">
                      {sdr.nota > 0 ? sdr.nota.toFixed(1) : '--'}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">SPIN Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Volume</span>
                    </div>
                    <p className="font-bold text-slate-800">{sdr.volume}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Target className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Avaliadas</span>
                    </div>
                    <p className="font-bold text-emerald-600">{sdr.validos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}