# Arquitetura do Projeto - V1

Este documento define as regras de arquitetura para a versão 1.0 da plataforma SDR VoiceInsights.

## Fluxo de Dados
**Frontend (Client)** -> **API (Backend)** -> **Firestore**

O frontend nunca deve acessar o banco de dados diretamente.

## Camadas e Responsabilidades

### 1. Frontend (src/app/...)
- Interface do Usuário (React components).
- Gerenciamento de estado de UI.
- Chamadas de API via fetch para o diretório `/api`.
- **Proibido**: Importar SDK de Firestore no lado do cliente.

### 2. Backend (src/app/api/...)
- Endpoints que servem o frontend.
- Lógica de negócio e processamento de dados.
- Conexão exclusiva com o Firestore.
- Segurança e validação de requisições.

### 3. Banco de Dados (Firestore)
- Persistência de documentos de chamadas, equipes e SDRs.
- Garantia de integridade dos dados.

## Modelo de Dados (SDRCall)
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
