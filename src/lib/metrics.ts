import { SDRCall, StatusFinal } from '@/types';

/**
 * 🛠️ FILTRO DE SEGURANÇA FLEXÍVEL
 * Antes só aceitava "DONE". Agora, se a IA deu uma nota (nota_spin > 0),
 * nós consideramos a chamada válida para a média, independente do status.
 */
const filterValidCalls = (calls: SDRCall[]) => 
  calls.filter(c => c.processingStatus === "DONE" || (Number(c.nota_spin) > 0));

/**
 * 📈 CÁLCULO DE MÉDIA SPIN
 * Agora usa o filtro flexível e garante que notas em formato de texto viraram números.
 */
export function calculateAverageSpin(calls: SDRCall[]): number {
  const analyzed = filterValidCalls(calls);
  
  // Se não tem chamada validada, retornamos 0
  if (analyzed.length === 0) return 0;

  // 🚩 PONTO DE ALTERAÇÃO: Number() garante que "6" vira 6 para a conta não quebrar
  const total = analyzed.reduce((acc, call) => acc + (Number(call.nota_spin) || 0), 0);
  
  return parseFloat((total / analyzed.length).toFixed(1));
}

/**
 * 📊 CONTAGEM DE STATUS (APROVADO/ATENÇÃO/REPROVADO)
 */
export function getStatusCounts(calls: SDRCall[]) {
  const analyzed = filterValidCalls(calls);
  
  return analyzed.reduce(
    (acc, call) => {
      const status = call.status_final || "NAO_IDENTIFICADO";
      if (acc[status] !== undefined) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    },
    { APROVADO: 0, ATENCAO: 0, REPROVADO: 0, NAO_IDENTIFICADO: 0 } as Record<StatusFinal, number>
  );
}

/**
 * 🏆 RANKING DE SDRS
 * Agora o ranking também considera o Gregorio Goulart para a média da Ana Julia.
 */
export function getSDRRanking(calls: SDRCall[]) {
  const grouped = calls.reduce((acc, call) => {
    const name = call.ownerName || "Não Identificado";
    
    if (!acc[name]) {
      acc[name] = { name, calls: [], totalSpin: 0, doneCount: 0 };
    }

    acc[name].calls.push(call);

    // 🚩 PONTO DE ALTERAÇÃO: A lógica do ranking agora bate com a lógica da média
    const isAnalyzed = call.processingStatus === "DONE" || (Number(call.nota_spin) > 0);

    if (isAnalyzed) {
      acc[name].totalSpin += (Number(call.nota_spin) || 0);
      acc[name].doneCount += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; calls: SDRCall[]; totalSpin: number; doneCount: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      avgSpin: sdr.doneCount > 0 ? parseFloat((sdr.totalSpin / sdr.doneCount).toFixed(1)) : 0,
      count: sdr.calls.length, // Tentativas Totais
      analyzedCount: sdr.doneCount // Chamadas que entraram na média
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin);
}

/**
 * 📅 VALIDAÇÃO DE PERÍODO (FILTROS)
 * Mantendo o suporte para os formatos de data do Firebase (_seconds e seconds).
 */
export function isWithinPeriod(dateInput: any, period: string): boolean {
  if (!dateInput || period === 'all') return true;

  const seconds = dateInput?._seconds || dateInput?.seconds || (typeof dateInput === 'number' ? dateInput / 1000 : null);
  
  const date = seconds ? new Date(seconds * 1000) : new Date(dateInput);
  
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today': 
      return date >= startOfToday;
    case '7d':
    case '7days':
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo;
    case 'month':
    case '30days':
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    default: 
      return true;
  }
}