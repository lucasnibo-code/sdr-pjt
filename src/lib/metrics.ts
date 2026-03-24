import { SDRCall, StatusFinal } from '@/types';

// Filtro para pegar apenas o que foi analisado de verdade
const filterDone = (calls: SDRCall[]) => calls.filter(c => c.processingStatus === "DONE");

export function calculateAverageSpin(calls: SDRCall[]): number {
  const analyzed = filterDone(calls);
  if (analyzed.length === 0) return 0;
  const total = analyzed.reduce((acc, call) => acc + (call.nota_spin || 0), 0);
  return parseFloat((total / analyzed.length).toFixed(1));
}

export function getStatusCounts(calls: SDRCall[]) {
  // Só contamos o status de chamadas que foram REALMENTE analisadas (DONE)
  const analyzed = filterDone(calls);
  
  return analyzed.reduce(
    (acc, call) => {
      const status = call.status_final || "NAO_IDENTIFICADO";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { APROVADO: 0, ATENCAO: 0, REPROVADO: 0, NAO_IDENTIFICADO: 0 } as Record<StatusFinal, number>
  );
}

export function getSDRRanking(calls: SDRCall[]) {
  const grouped = calls.reduce((acc, call) => {
    const name = call.ownerName || "Não Identificado";
    if (!acc[name]) {
      acc[name] = { name, calls: [], totalSpin: 0, doneCount: 0 };
    }
    acc[name].calls.push(call);
    if (call.processingStatus === "DONE") {
      acc[name].totalSpin += (call.nota_spin || 0);
      acc[name].doneCount += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; calls: SDRCall[]; totalSpin: number; doneCount: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      avgSpin: sdr.doneCount > 0 ? parseFloat((sdr.totalSpin / sdr.doneCount).toFixed(1)) : 0,
      count: sdr.calls.length, // Volume Total
      analyzedCount: sdr.doneCount // Volume Real
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin);
}

export function isWithinPeriod(dateInput: any, period: string): boolean {
  if (!dateInput || period === 'all') return true;
  const date = dateInput?.seconds ? new Date(dateInput.seconds * 1000) : new Date(dateInput);
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today': return date >= startOfToday;
    case '7d':
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo;
    case 'month':
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    default: return true;
  }
}