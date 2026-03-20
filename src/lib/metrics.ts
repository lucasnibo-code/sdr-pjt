import type { SDRCall, StatusFinal } from '@/types';

export function calculateAverageSpin(calls: SDRCall[]): number {
  if (calls.length === 0) return 0;
  const total = calls.reduce((acc, call) => acc + call.nota_spin, 0);
  return parseFloat((total / calls.length).toFixed(1));
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
    acc[call.ownerName].calls.push(call);
    acc[call.ownerName].totalSpin += call.nota_spin;
    return acc;
  }, {} as Record<string, { name: string; calls: any[]; totalSpin: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      avgSpin: parseFloat((sdr.totalSpin / sdr.calls.length).toFixed(1)),
      count: sdr.calls.length
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin);
}
