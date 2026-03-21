import type { SDRCall, StatusFinal } from '@/types';

export function calculateAverageSpin(calls: SDRCall[]): number {
  const validCalls = calls.filter(call => typeof call.nota_spin === 'number' && !isNaN(call.nota_spin));
  if (validCalls.length === 0) return 0;
  const total = validCalls.reduce((acc, call) => acc + call.nota_spin, 0);
  return parseFloat((total / validCalls.length).toFixed(1));
}

export function getStatusCounts(calls: SDRCall[]) {
  return calls.reduce(
    (acc, call) => {
      acc[call.status_final] = (acc[call.status_final] || 0) + 1;
      return acc;
    },
    { APROVADO: 0, ATENCAO: 0, REPROVADO: 0, NAO_IDENTIFICADO: 0 } as Record<StatusFinal, number>
  );
}

export function getSDRRanking(calls: SDRCall[]) {
  const grouped = calls.reduce((acc, call) => {
    if (!acc[call.ownerName]) {
      acc[call.ownerName] = { name: call.ownerName, calls: [], totalSpin: 0 };
    }
    const val = call.nota_spin;
    const isValidNota = typeof val === 'number' && !isNaN(val);
    
    acc[call.ownerName].calls.push(call);
    if (isValidNota) {
      acc[call.ownerName].totalSpin += val;
    }
    return acc;
  }, {} as Record<string, { name: string; calls: any[]; totalSpin: number }>);

  return Object.values(grouped)
    .map(sdr => {
      const validCalls = sdr.calls.filter(c => typeof c.nota_spin === 'number' && !isNaN(c.nota_spin));
      return {
        name: sdr.name,
        avgSpin: validCalls.length > 0 ? parseFloat((sdr.totalSpin / validCalls.length).toFixed(1)) : 0,
        count: sdr.calls.length
      };
    })
    .sort((a, b) => b.avgSpin - a.avgSpin);
}

/**
 * Verifica se uma data está dentro do período selecionado.
 * Normaliza analyzedAt sem assumir formato ISO fixo.
 */
export function isWithinPeriod(dateStr: string | null, period: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return date >= startOfToday;
    case '7d':
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo;
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    case 'year':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    case 'all':
    default:
      return true;
  }
}

/**
 * Calcula estatísticas globais para o dashboard.
 */
export function getGlobalStats(calls: SDRCall[]) {
  const validCalls = calls.filter(call => typeof call.nota_spin === 'number' && !isNaN(call.nota_spin));
  const uniqueSDRs = new Set(calls.map(c => c.ownerName));
  
  return {
    avgSpin: calculateAverageSpin(calls),
    totalCalls: calls.length,
    sdrCount: uniqueSDRs.size
  };
}
