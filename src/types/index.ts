
export type StatusFinal = "APROVADO" | "ATENCAO" | "REPROVADO" | "NAO_IDENTIFICADO";

export interface SDRCall {
  id: string;
  callId: string;
  title: string;
  ownerId: string | null;
  ownerName: string;
  ownerUserId: string | null;
  teamId: string | null;
  teamName: string;
  durationMs: number;
  recordingUrl: string | null;
  analyzedAt: string | null;
  status_final: StatusFinal;
  nota_spin: number;
  resumo: string;
  alertas: string[];
  ponto_atencao: string;
  maior_dificuldade: string;
  pontos_fortes: string[];
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
