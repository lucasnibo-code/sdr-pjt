
import { NextResponse } from 'next/server';
import type { SDRCall } from '@/types';

export async function GET() {
  const mockCalls: SDRCall[] = [
    {
      id: "1",
      callId: "call_001",
      title: "Discovery Acme Corp",
      ownerId: "u1",
      ownerName: "João Silva",
      ownerUserId: "user_123",
      teamId: "t1",
      teamName: "Enterprise North",
      durationMs: 920000,
      recordingUrl: "https://example.com/recording1.mp3",
      analyzedAt: "2024-05-20T10:30:00Z",
      status_final: "APROVADO",
      nota_spin: 8.5,
      resumo: "O prospect demonstrou clara dor em relação ao tempo de fechamento manual. Identificada oportunidade de expansão para outras unidades.",
      alertas: ["Concorrência citada: Salesforce", "Prazo curto para implementação"],
      ponto_atencao: "Necessidade de integração customizada com sistema legado.",
      maior_dificuldade: "Explicar a precificação por volume sem assustar o CFO.",
      pontos_fortes: ["Ótimo rapport inicial", "Pergunta de Implicação bem executada", "Condução para o Next Step"],
    },
    {
      id: "2",
      callId: "call_002",
      title: "Follow-up Globex",
      ownerId: "u2",
      ownerName: "Maria Souza",
      ownerUserId: "user_456",
      teamId: "t1",
      teamName: "Enterprise North",
      durationMs: 450000,
      recordingUrl: null,
      analyzedAt: "2024-05-20T11:45:00Z",
      status_final: "ATENCAO",
      nota_spin: 6.2,
      resumo: "Ligação rápida. O prospect pareceu apressado e não conseguimos aprofundar nas perguntas de necessidade.",
      alertas: ["Falta de clareza no orçamento"],
      ponto_atencao: "Dificuldade em manter o prospect focado no valor ao invés de preço.",
      maior_dificuldade: "Controlar o tempo da chamada.",
      pontos_fortes: ["Resiliência", "Agendamento da próxima reunião garantido"],
    },
    {
      id: "3",
      callId: "call_003",
      title: "Venda Direta Stark Industries",
      ownerId: "u3",
      ownerName: "Ricardo Oliveira",
      ownerUserId: "user_789",
      teamId: "t2",
      teamName: "SME West",
      durationMs: 1200000,
      recordingUrl: "https://example.com/recording3.mp3",
      analyzedAt: "2024-05-19T14:20:00Z",
      status_final: "REPROVADO",
      nota_spin: 4.0,
      resumo: "Vendedor falou demais e não ouviu as dores do cliente. Faltou técnica de SPIN.",
      alertas: ["Monólogo de 5 minutos", "Interrupções constantes"],
      ponto_atencao: "Escuta ativa quase inexistente.",
      maior_dificuldade: "Deixar o prospect falar.",
      pontos_fortes: ["Conhecimento do produto"],
    }
  ];

  return NextResponse.json(mockCalls);
}
