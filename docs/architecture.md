# Arquitetura do Projeto - V1 (Escopo Reduzido)

Este documento define as regras de arquitetura e o escopo oficial para a versão 1.0 da plataforma SDR VoiceInsights.

## 1. Fluxo de Dados
**Frontend (Client)** -> **API (Backend)** -> **Firestore**

O frontend nunca deve acessar o banco de dados diretamente. Toda comunicação deve ser feita via endpoints de API.

## 2. Camadas e Responsabilidades

### Frontend (src/app/...)
- Interface do Usuário (React/Tailwind/ShadCN).
- Consumo de API via `fetch`.
- **Proibido**: Importar SDK de Firestore ou Firebase Auth no lado do cliente para operações de banco.

### Backend (src/app/api/...)
- Endpoints que servem o frontend.
- Conexão exclusiva com o Firestore.
- Segurança e validação.

### Banco de Dados (Firestore)
- Persistência dos documentos de chamadas seguindo o modelo `SDRCall`.

## 3. Escopo Oficial V1 (O que entra)
O foco da V1 é ser um **Visualizador de Análises**.

1. **Login**: Tela de acesso simplificada.
2. **Lista de Chamadas**: Listagem simples com busca básica, status e nota.
3. **Detalhe da Chamada**: Exibição completa dos insights gerados pela IA (Resumo, Alertas, Pontos Fortes, etc).

## 4. Fora de Escopo V1 (Pausado)
- Dashboards com métricas agregadas e gráficos.
- Rankings de SDRs.
- Agrupamento e telas de Equipes.
- Exportação de dados (CSV/PDF).
- Filtros avançados e comparativos.

## 5. Modelo de Dados (SDRCall)
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
