export type StatusFinal = "APROVADO" | "ATENCAO" | "REPROVADO" | "NAO_IDENTIFICADO";
export type CallSource = "HUBSPOT" | "MANUAL";

export interface SDRCall {
  id: string;               // ID único no sistema (Firestore)
  callId: string;           // ID de referência externa
  title: string;            // Título da chamada
  ownerId: string | null;
  ownerName: string;        // Nome do SDR
  ownerUserId: string | null;
  teamId: string | null;
  teamName: string;         // Nome da Equipe
  durationMs: number;       // Duração em ms
  recordingUrl: string | null;
  analyzedAt: string | null; // Data ISO
  status_final: StatusFinal;
  nota_spin: number;        // Nota 0-10
  source: CallSource;
  
  // Campos detalhados da análise
  resumo: string;
  alertas: string[];
  ponto_atencao: string;
  maior_dificuldade: string;
  pontos_fortes: string[];

  // --- NOVOS CAMPOS GEMINI 2.5 ---
  analise_escuta?: string;        // Avaliação do comportamento e escuta ativa
  perguntas_sugeridas?: string[]; // Lista de perguntas de impacto para coaching
}