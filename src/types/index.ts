export type StatusFinal = "APROVADO" | "ATENCAO" | "REPROVADO" | "NAO_IDENTIFICADO";
export type CallSource = "HUBSPOT" | "MANUAL";
export type ProcessingStatus = 'DONE' | 'SKIPPED_FOR_AUDIT' | 'NOT_CONNECTED' | 'SHORT_CALL' | 'FAILED_ANALYSIS' | 'NO_AUDIO';

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
  updatedAt: any;          // Adicionado para o filtro de data (Hoje/Mês)
  analyzedAt: any;         // Data da análise
  status_final: StatusFinal;
  nota_spin: number;
  source: CallSource;
  processingStatus?: ProcessingStatus; // O CAMPO CHAVE PARA O FILTRO
  
  // Detalhes da análise
  resumo: string;
  alertas: string[];
  ponto_atencao: string;
  maior_dificuldade: string;
  pontos_fortes: string | string[]; // Suporta os dois formatos

  // Campos Gemini 2.5
  analise_escuta?: string;
  perguntas_sugeridas?: string[];
}