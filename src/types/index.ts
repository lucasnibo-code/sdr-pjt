export type StatusFinal = "APROVADO" | "ATENCAO" | "REPROVADO" | "NAO_IDENTIFICADO";
export type CallSource = "HUBSPOT" | "MANUAL";

export interface SDRCall {
  id: string;
  callId: string;
  title: string;
  ownerName: string;
  teamName: string;
  analyzedAt: string | null;
  durationMs: number;
  nota_spin: number;
  status_final: StatusFinal;
  source: CallSource;
  // Campos detalhados (opcionais na listagem)
  resumo?: string;
  alertas?: string[];
  ponto_atencao?: string;
  maior_dificuldade?: string;
  pontos_fortes?: string[];
  recordingUrl?: string | null;
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
