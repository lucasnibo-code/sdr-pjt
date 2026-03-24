import { SDRCall, StatusFinal } from '@/types';

/**
 * 📅 VALIDAÇÃO DE PERÍODO (FILTROS)
 * Aprimorado para ser mais robusto na interpretação de datas do Firebase
 * e para definir corretamente o início do mês para o filtro 'month'.
 */
// 🚩 1. TIPAGEM: Agora o 'period' aceita string OU um objeto com datas de Início e Fim
export function isWithinPeriod(dateInput: any, period: string | { start: Date | string, end: Date | string }) {
  if (!dateInput) return false;
  if (period === 'all') return true;

  const rawDate = dateInput?._seconds || dateInput?.seconds || dateInput;
  const seconds = typeof rawDate === 'number' ? rawDate : (rawDate?._seconds || rawDate?.seconds || null);
  
  let callDate: Date;
  if (seconds) {
    callDate = new Date(seconds * 1000);
  } else {
    callDate = new Date(dateInput);
  }

  if (isNaN(callDate.getTime())) return false;

  // 🚩 2. O NOVO SUPERPODER: Filtro Exato de Data Customizada
  if (typeof period === 'object' && period !== null) {
    const startDate = new Date(period.start);
    startDate.setHours(0, 0, 0, 0); // Trava no primeiro segundo do dia
    
    const endDate = new Date(period.end);
    endDate.setHours(23, 59, 59, 999); // Trava no último segundo do dia
    
    return callDate.getTime() >= startDate.getTime() && callDate.getTime() <= endDate.getTime();
  }

  // 3. Mantém a lógica antiga funcionando perfeitamente para os filtros rápidos
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - callDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (period === 'today') {
    return callDate.getDate() === now.getDate() && 
           callDate.getMonth() === now.getMonth() && 
           callDate.getFullYear() === now.getFullYear();
  }
  if (period === '7d' || period === '7days') return diffDays <= 7;
  if (period === '30days') return diffDays <= 30;
  if (period === 'month') {
    return callDate.getMonth() === now.getMonth() && callDate.getFullYear() === now.getFullYear();
  }

  return true;
}

/**
 * 🛠️ FILTRO DE SEGURANÇA FLEXÍVEL PARA CÁLCULO DE MÉDIA
 * Uma chamada entra para a média se:
 * 1. O status for "DONE" E tiver uma nota numérica (mesmo que 0.0).
 * 2. OU se NÃO for "SKIPPED_FOR_AUDIT", tiver uma nota numérica E essa nota for maior que zero
 *    (Isso lida com casos legados/bugados que não tinham status "DONE" mas tinham nota > 0).
 * Chamadas "SKIPPED_FOR_AUDIT" são explicitamente excluídas da média.
 */
const filterValidCalls = (calls: SDRCall[]) => calls.filter(c => {
    const hasNumericScore = typeof c.nota_spin === 'number' && !isNaN(c.nota_spin);
    
    // 🚩 ALTERAÇÃO: Inclui notas 0.0 para chamadas "DONE".
    // 🚩 EXCLUI chamadas "SKIPPED_FOR_AUDIT" da média.
    
    // Condição 1: Chamada está "DONE" e tem uma nota numérica (incluindo 0.0)
    if (c.processingStatus === "DONE" && hasNumericScore) {
        return true;
    }
    
    // Condição 2: Chamada NÃO é "SKIPPED_FOR_AUDIT" e tem uma nota > 0 (para casos legados)
    if (c.processingStatus !== "SKIPPED_FOR_AUDIT" && hasNumericScore && c.nota_spin > 0) {
        return true;
    }
    
    return false; // Fora dessas condições, a chamada não é válida para a média
});

/**
 * 📈 CÁLCULO DE MÉDIA SPIN
 * Utiliza o `filterValidCalls` atualizado.
 */
export function calculateAverageSpin(calls: SDRCall[]): number {
  const analyzed = filterValidCalls(calls);
  
  if (analyzed.length === 0) return 0;

  // Number() garante que notas que venham como string não quebrem a soma
  const total = analyzed.reduce((acc, call) => acc + (Number(call.nota_spin) || 0), 0);
  
  return parseFloat((total / analyzed.length).toFixed(1));
}

/**
 * 📊 CONTAGEM DE STATUS (APROVADO/ATENÇÃO/REPROVADO)
 * Utiliza o mesmo filtro de `filterValidCalls` para garantir consistência.
 */
export function getStatusCounts(calls: SDRCall[]) {
  const analyzed = filterValidCalls(calls); // 🚩 ALTERAÇÃO: Usa o novo `filterValidCalls`.
  
  return analyzed.reduce(
    (acc, call) => {
      // 🚩 GARANTIA: `status_final` pode ser nulo ou undefined, usa "NAO_IDENTIFICADO" como fallback.
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
 * Aprimorado para separar `count` (todas as chamadas) de `analyzedCount` (apenas as que contribuem para a média).
 */
export function getSDRRanking(calls: SDRCall[]) {
  if (!calls || !Array.isArray(calls)) return [];
  
  const grouped = calls.reduce((acc, call) => {
    const name = call.ownerName || "Não Identificado";
    
    if (!acc[name]) {
      acc[name] = { name, calls: [], totalSpin: 0, doneCount: 0 };
    }

    // Registra TODAS as chamadas (tentativas + conectadas + analisadas)
    acc[name].calls.push(call);

    // 🚩 ALTERAÇÃO: Lógica para determinar se a chamada contribui para a média e para analyzedCount.
    // Reutiliza a mesma lógica do `filterValidCalls` para consistência.
    const hasNumericScore = typeof call.nota_spin === 'number' && !isNaN(call.nota_spin);
    const contributesToAverage = 
        (call.processingStatus === "DONE" && hasNumericScore) || 
        (call.processingStatus !== "SKIPPED_FOR_AUDIT" && hasNumericScore && call.nota_spin > 0);

    if (contributesToAverage) {
      acc[name].totalSpin += Number(call.nota_spin || 0);
      acc[name].doneCount += 1;
    }

    // 🚩 GARANTIA: Essencial para o reduce continuar funcionando
    return acc; 
  }, {} as Record<string, { name: string; calls: SDRCall[]; totalSpin: number; doneCount: number }>);

  return Object.values(grouped)
    .map(sdr => ({
      name: sdr.name,
      avgSpin: sdr.doneCount > 0 ? parseFloat((sdr.totalSpin / sdr.doneCount).toFixed(1)) : 0,
      count: sdr.calls.length,       // 🚩 Retorna o volume total de chamadas do SDR (todas, incluindo tentativas)
      analyzedCount: sdr.doneCount   // 🚩 Retorna o volume de chamadas que contribuíram para a média (DONE ou com nota > 0 e não SKIPPED)
    }))
    .sort((a, b) => b.avgSpin - a.avgSpin); // Mantém a ordenação por média SPIN
}