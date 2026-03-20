
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  FileText, 
  Zap, 
  Star,
  Download,
  Share2,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function CallDetailPage() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  // Mock call data
  const callData = {
    title: 'Initial Discovery - Acme Corp',
    sdr: 'John Doe',
    date: '15 de Maio, 2024',
    duration: '15:20',
    status: 'completed',
    score: 85,
    summary: 'A reunião focou em entender as dores atuais da Acme Corp no processo de faturamento. O prospect demonstrou interesse em automação e integração com CRM existente.',
    keyPoints: [
      'Prospect utiliza sistema legado para faturamento.',
      'Deseja reduzir tempo de fechamento mensal em 50%.',
      'Orçamento pré-aprovado para Q3.',
      'Necessidade de integração com Salesforce.'
    ],
    transcript: [
      { speaker: 'SDR', time: '0:05', text: 'Bom dia! Aqui é o John da VoiceInsights. Como você está hoje?' },
      { speaker: 'Prospect', time: '0:12', text: 'Olá John, tudo bem por aqui. Estava aguardando sua ligação.' },
      { speaker: 'SDR', time: '0:20', text: 'Excelente. O objetivo hoje é entender um pouco mais sobre como vocês gerenciam o faturamento atualmente.' },
      { speaker: 'Prospect', time: '0:35', text: 'Perfeito. Atualmente temos um processo muito manual. Levamos quase 10 dias para fechar o mês.' },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-headline font-bold text-primary">{callData.title}</h1>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Auditado</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Realizada por <span className="font-semibold">{callData.sdr}</span> • {callData.date} • {callData.duration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player Card */}
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-70">Playing: {callData.title}</span>
                  <span className="text-xs font-mono">04:35 / {callData.duration}</span>
                </div>
                <Progress value={progress} className="h-1 bg-white/20" />
                <div className="flex items-center justify-center gap-6">
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <Rewind className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-white text-primary hover:bg-white/90" 
                    size="icon"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <FastForward className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcript">Transcrição</TabsTrigger>
              <TabsTrigger value="ai-insights">IA Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-6 max-h-[500px] overflow-y-auto">
                  {callData.transcript.map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 text-xs font-mono text-muted-foreground mt-1">
                        [{line.time}]
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          {line.speaker}
                        </p>
                        <p className="text-sm leading-relaxed">{line.text}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai-insights" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Resumo da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {callData.summary}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Pontos-Chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {callData.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Evaluation Card */}
          <Card className="border-secondary/50">
            <CardHeader className="bg-secondary/10">
              <CardTitle className="text-lg">Avaliação Final</CardTitle>
              <CardDescription>Critérios baseados em Playbook.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-1">Score Geral</p>
                <div className="text-5xl font-headline font-bold text-primary">
                  {callData.score}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Rapport', score: 90 },
                  { label: 'Qualificação Técnica', score: 75 },
                  { label: 'Contorno de Objeções', score: 85 },
                  { label: 'Next Steps', score: 100 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-bold">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-1.5" />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Star className="w-4 h-4 mr-2" /> Editar Avaliação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notas do Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full min-h-[120px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-primary outline-none"
                placeholder="Adicione um feedback para o SDR..."
              />
              <Button size="sm" className="mt-2 w-full">Salvar Notas</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
