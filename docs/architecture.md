# Arquitetura e Fluxos do Projeto - V1

Este documento define as regras de arquitetura, fluxos e o modelo de dados oficial para a V1 da plataforma SDR VoiceInsights.

## 1. Arquitetura de Comunicação
**Frontend (Client)** -> **API (Backend)** -> **Firestore**

O frontend NUNCA acessa o banco de dados diretamente. Toda comunicação é feita via endpoints de API (`/api/calls`).

## 2. Definição de Fluxos

### Fluxo Principal (Automático)
1. **Origem**: HubSpot (via Webhook).
2. **Backend**: Recebe a notificação, baixa o áudio, executa Genkit (Transcrição + Análise).
3. **Persistência**: Salva o objeto `SDRCall` no Firestore.
4. **Consumo**: Frontend lista os dados via API.

### Fluxo Auxiliar (Validação/Interno)
1. **Origem**: Upload Manual no Frontend.
2. **Backend**: Recebe o arquivo, executa a mesma esteira de IA.
3. **Persistência**: Salva no Firestore para comparação e ajuste de prompt.

## 3. Escopo Oficial V1 (Recortado)
O foco da V1 é ser um **Visualizador de Análises**.

1. **Login**: Acesso visual simplificado.
2. **Lista de Chamadas**: Listagem cronológica com triagem por Status e Nota.
3. **Detalhe da Chamada**: Exibição completa dos insights (Resumo, Alertas, Pontos Fortes, etc).
4. **Ingestão Manual**: Tela de upload para validação técnica do algoritmo.

## 4. Modelo de Dados (SDRCall)
```typescript
{
  id: string
  callId: string
  title: string
  ownerId: string | null
  ownerName: string
  ownerUserId: string | null
  teamId: string | null
  teamName: string
  durationMs: number
  recordingUrl: string | null
  analyzedAt: string | null
  status_final: "APROVADO" | "ATENCAO" | "REPROVADO" | "NAO_IDENTIFICADO"
  nota_spin: number
  resumo: string
  alertas: string[]
  ponto_atencao: string
  maior_dificuldade: string
  pontos_fortes: string[]
}
```

## 5. Responsabilidades
- **Frontend**: Exibição e Ingestão manual.
- **Backend**: Proxy de dados, Segurança e Processamento de IA.
- **Firestore**: Armazenamento e persistência.
