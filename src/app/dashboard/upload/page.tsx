
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileAudio, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulating upload progress
    for (let i = 0; i <= 100; i += 20) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 400));
    }

    toast({
      title: "Upload Concluído",
      description: "Sua gravação está sendo processada pela nossa IA.",
    });

    setIsUploading(false);
    router.push('/dashboard/calls');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Ingestão de Dados</h1>
        <p className="text-muted-foreground mt-1">Envie suas gravações ou linke de fontes externas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>Formatos suportados: MP3, WAV, M4A. Tamanho máximo 50MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/5",
                isUploading ? "pointer-events-none opacity-50" : ""
              )}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
                  <p className="font-medium">Fazendo upload... {uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Arraste e solte o áudio aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar do seu computador</p>
                  </div>
                  <Input type="file" className="hidden" id="file-upload" accept="audio/*" />
                  <Label htmlFor="file-upload" className="block">
                    <Button type="button" variant="secondary">Selecionar Arquivo</Button>
                  </Label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="call-title">Título da Chamada</Label>
                <Input id="call-title" placeholder="Ex: Prospecção Inicial - Empresa XYZ" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sdr-name">Nome do SDR</Label>
                <Input id="sdr-name" placeholder="Nome do responsável" required />
              </div>
            </div>

            <Button className="w-full" size="lg" disabled={isUploading}>
              {isUploading ? "Processando..." : "Iniciar Análise"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Externo</CardTitle>
          <CardDescription>Vincule uma gravação hospedada no Google Drive, Dropbox ou Zoom.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="https://drive.google.com/..." />
            </div>
            <Button variant="outline">Verificar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
