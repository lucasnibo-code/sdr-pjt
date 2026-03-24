import { SDRCall, StatusFinal } from '@/types';

/**
 * 🛠️ FILTRO DE SEGURANÇA FLEXÍVEL
 * Aceita DONE ou qualquer chamada que a IA conseguiu dar nota.
 */
const filterValidCalls = (calls: SDRCall[]) => 
  calls.filter(c => c.processingStatus === "DONE" || (Number(c.nota_spin) > 0));

/**
 * 📈 CÁLCULO DE MÉDIA SPIN
 */
export function calculateAverageSpin(calls: SDRCall[]): number {
  const analyzed = filterValidCalls(calls);
  
  if (analyzed.length === 0) return 0;

  const total = analyzed.reduce((acc, call) => acc + (Number(call.nota_spin || 0)), 0);
  
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
 * Corrigido para não quebrar (adicionado return acc) e contar tentativas corretamente.
 */
export function getSDRRanking(calls: SDRCall[]) {
  if (!calls || !Array.isArray(calls)) return [];
  
  const grouped = calls.reduce((acc, call) => {
    const name = call.ownerName || "Não Identificado";
    
    if (!acc[name]) {
      acc[name] = { name, calls: [], totalSpin: 0, doneCount: 0 };
    }

    // Registra a chamada no grupo do SDR (independente de ser nota ou tentativa)
    acc[name].calls.push(call);

    // Lógica para média: DONE ou se houver nota real
    const isAnalyzed = call.processingStatus === "DONE" || (Number(call.nota_spin) > 0);

    if (isAnalyzed) {
      acc[name].totalSpin += Number(call.nota_spin || 0);
      acc[name].doneCount += 1;
    }

    // 🚩 MARCAÇÃO: O retorno do acumulador é obrigatório para não quebrar a função
    return acc; 
  }, {} as Record<string, { name: string; calls: SDRCall[]; totalSpin: number; doneCount: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      avgSpin: sdr.doneCount > 0 ? parseFloat((sdr.totalSpin / sdr.doneCount).toFixed(1)) : 0,
      count: sdr.calls.length, // Agora vai mostrar as 5 tentativas da Amaranta
      analyzedCount: sdr.doneCount 
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin);
}

/**
 * 📅 VALIDAÇÃO DE PERÍODO (FILTROS)
 * Suporte robusto para datas de tentativas (SKIPPED_FOR_AUDIT) e analisadas.
 */
export function isWithinPeriod(dateInput: any, period: string): boolean {
  if (!dateInput || period === 'all') return true;

  // Tenta capturar segundos de várias estruturas do Firebase
  const rawDate = dateInput?._seconds || dateInput?.seconds || dateInput;
  const seconds = typeof rawDate === 'number' ? rawDate : (rawDate?._seconds || rawDate?.seconds || null);
  
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