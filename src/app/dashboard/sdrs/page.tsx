"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Target, PhoneCall, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- TIPAGEM ---
interface API_SDRStats {
  nota_media?: string | number;
  calls?: string | number;
  valid_calls?: string | number;
}

interface SDRRankingItem {
  name: string;
  nota: number;
  volume: number;
  validos: number;
}

export default function SDRsPage() {
  const [ranking, setRanking] = useState<SDRRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🚩 ESTADOS DE FILTRO DE DATA
  const [dateFilter, setDateFilter] = useState('month'); // Padrão: Mês atual
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 1. Memoize o cálculo de datas para evitar repetição
  const getDateRange = () => {
    const now = new Date();
    let startIso = '';
    let endIso = '';

    const toLocalISO = (date: Date) => {
      // Ajuste para pegar a data local ignorando o fuso UTC no split
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().split('T')[0];
    };

    if (dateFilter === 'today') {
      const today = toLocalISO(now);
      startIso = `${today}T00:00:00.000Z`;
      endIso = `${today}T23:59:59.999Z`;
    } else if (dateFilter === '7d') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      startIso = `${toLocalISO(past)}T00:00:00.000Z`;
      endIso = `${toLocalISO(now)}T23:59:59.999Z`;
    } else if (dateFilter === 'month') {
      const monthStr = String(now.getMonth() + 1).padStart(2, '0');
      startIso = `${now.getFullYear()}-${monthStr}-01T00:00:00.000Z`;
      endIso = `${toLocalISO(now)}T23:59:59.999Z`;
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      // Validação simples
      if (customStartDate > customEndDate) return { startIso: '', endIso: '' };
      startIso = `${customStartDate}T00:00:00.000Z`;
      endIso = `${customEndDate}T23:59:59.999Z`;
    }

    return { startIso, endIso };
  };

  const fetchData = async () => {
    // Se for custom e as datas não estiverem preenchidas, não busca ainda
    if (dateFilter === 'custom' && (!customStartDate || !customEndDate)) return;

    setIsLoading(true);
    setError(null);

    try {
      const { startIso, endIso } = getDateRange();
      let summaryUrl = `/api/stats/summary?t=${Date.now()}`;
      
      if (dateFilter !== 'all' && startIso && endIso) {
        summaryUrl += `&startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}`;
      }

      const res = await fetch(summaryUrl);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao carregar o ranking de SDRs. Tente novamente.');
      }

      if (data.sdr_ranking) {
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
        setRanking([]); 
      }
    } catch (err: any) {
      console.error("❌ Erro ao carregar SDRs:", err);
      setError(err.message || 'Erro inesperado de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. useEffect observando todas as mudanças de filtro
  useEffect(() => {
    fetchData();
  }, [dateFilter, customStartDate, customEndDate]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // 3. Melhoria na UX de Loading (Cabeçalho sempre visível)
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 🚩 CABEÇALHO COM FILTRO DE DATAS ADICIONADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Equipe de Vendas</h1>
          <p className="text-slate-400 text-sm mt-1">Ranking e performance dos SDRs por período.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center h-8">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="month">Mês atual</option>
                <option value="all">Todo o período</option>
                <option value="custom">Personalizado...</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 sm:ml-2 sm:pl-3 sm:border-l border-slate-100 animate-in zoom-in duration-200">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)} 
                  className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"
                />
                <span className="text-slate-300 text-[10px] font-bold">ATÉ</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={e => setCustomEndDate(e.target.value)} 
                  className="h-8 text-xs font-medium text-slate-600 rounded-lg px-2 outline-none"
                />
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={fetchData}><RefreshCw className="w-3 h-3"/></Button>
              </div>
            )}
          </div>
          
          <Button onClick={fetchData} variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>

      {/* 🚩 RENDERIZAÇÃO CONDICIONAL ABAIXO DO CABEÇALHO */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
           <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">CARREGANDO RANKING...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 animate-in fade-in zoom-in duration-300">
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
      ) : ranking.length === 0 ? (
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