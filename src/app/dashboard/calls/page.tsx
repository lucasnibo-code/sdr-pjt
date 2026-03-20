
"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { SDRCall, StatusFinal } from '@/types';
import { cn } from '@/lib/utils';

export default function CallsListPage() {
  const [calls, setCalls] = useState<SDRCall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        setCalls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setCalls([]);
        setIsLoading(false);
      });
  }, []);

  const getStatusBadge = (status: StatusFinal) => {
    switch (status) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'ATENCAO':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"><AlertCircle className="w-3 h-3 mr-1" /> Atenção</Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Reprovado</Badge>;
      default:
        return <Badge variant="outline"><ShieldCheck className="w-3 h-3 mr-1" /> N/I</Badge>;
    }
  };

  const filteredCalls = calls.filter(call => 
    call.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Histórico de Chamadas</h1>
          <p className="text-muted-foreground mt-1">Dados reais de todas as avaliações realizadas.</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Buscar por título, SDR ou time..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/30">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Título</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">SDR / Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status Final</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nota SPIN</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duração</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground">Carregando chamadas...</td>
                    </tr>
                  ) : filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground">Nenhuma chamada encontrada.</td>
                    </tr>
                  ) : (
                    filteredCalls.map((call) => (
                      <tr key={call.id} className="border-b transition-colors hover:bg-muted/20">
                        <td className="p-4 align-middle font-medium">{call.title || 'Chamada sem Título'}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs">{call.ownerName}</span>
                            <span className="text-[10px] text-muted-foreground">{call.teamName}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{getStatusBadge(call.status_final)}</td>
                        <td className="p-4 align-middle font-bold text-primary">{call.nota_spin}</td>
                        <td className="p-4 align-middle">{(call.durationMs / 60000).toFixed(1)} min</td>
                        <td className="p-4 align-middle text-right">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/calls/${call.id}`}>
                              Revise <ChevronRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
