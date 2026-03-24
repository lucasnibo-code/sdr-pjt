import { SDRCall, StatusFinal } from '@/types';

/**
 * 🛠️ FILTRO GLOBAL DE SEGURANÇA
 * Este filtro garante que só calcularemos médias de chamadas que a IA
 * realmente processou com sucesso (DONE).
 */
const filterDone = (calls: SDRCall[]) => 
  calls.filter(c => c.processingStatus === "DONE");

/**
 * 📈 CÁLCULO DE MÉDIA SPIN
 * Alterado para retornar 0 apenas se houver chamadas processadas com nota 0.
 * Se não houver chamadas "DONE", o componente visual deve tratar como "--".
 */
export function calculateAverageSpin(calls: SDRCall[]): number {
  const analyzed = filterDone(calls);
  
  // Se não tem chamada validada, retornamos 0 para evitar erro de divisão (NaN)
  if (analyzed.length === 0) return 0;

  const total = analyzed.reduce((acc, call) => acc + (call.nota_spin || 0), 0);
  
  // Retorna a média com 1 casa decimal
  return parseFloat((total / analyzed.length).toFixed(1));
}

/**
 * 📊 CONTAGEM DE STATUS (APROVADO/ATENÇÃO/REPROVADO)
 * Garante que o gráfico de pizza ou barras não conte chamadas descartadas.
 */
export function getStatusCounts(calls: SDRCall[]) {
  // Ignora chamadas curtas ou não conectadas (não DONE)
  const analyzed = filterDone(calls);
  
  return analyzed.reduce(
    (acc, call) => {
      // Se a IA não identificou um status, cai no "NAO_IDENTIFICADO"
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
 * Organiza a lista principal. Diferencia "Volume de Tentativas" de "Volume Real".
 */
export function getSDRRanking(calls: SDRCall[]) {
  const grouped = calls.reduce((acc, call) => {
    const name = call.ownerName || "Não Identificado";
    
    if (!acc[name]) {
      acc[name] = { name, calls: [], totalSpin: 0, doneCount: 0 };
    }

    acc[name].calls.push(call);

    // 🚩 PONTO DE ALTERAÇÃO: A nota só entra no ranking se for DONE
    if (call.processingStatus === "DONE") {
      acc[name].totalSpin += (call.nota_spin || 0);
      acc[name].doneCount += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; calls: SDRCall[]; totalSpin: number; doneCount: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      // Média baseada apenas no que é produtivo
      avgSpin: sdr.doneCount > 0 ? parseFloat((sdr.totalSpin / sdr.doneCount).toFixed(1)) : 0,
      // count = Tentativas totais (ex: as 21 da Ana Julia)
      count: sdr.calls.length, 
      // analyzedCount = Só o que tem nota (ex: o 6.0 do Gregorio)
      analyzedCount: sdr.doneCount 
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin); // Ordena do melhor para o pior
}

/**
 * 📅 VALIDAÇÃO DE PERÍODO (FILTROS)
 * Ajustado para suportar os formatos de data do Firebase (_seconds e seconds).
 */
export function isWithinPeriod(dateInput: any, period: string): boolean {
  if (!dateInput || period === 'all') return true;

  // 🚩 PONTO DE ALTERAÇÃO: Suporte para _seconds (vindo do Firebase Admin/Scripts)
  // e seconds (vindo do SDK padrão do Firebase)
  const seconds = dateInput?._seconds || dateInput?.seconds || (typeof dateInput === 'number' ? dateInput / 1000 : null);
  
  const date = seconds ? new Date(seconds * 1000) : new Date(dateInput);
  
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today': 
      return date >= startOfToday;
    case '7d':
    case '7days': // Suporte para os dois nomes de filtro
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