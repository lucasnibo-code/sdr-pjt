
import { 
  PhoneCall, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { SDRCall, PerformanceMetric } from '@/types';

const mockMetrics: PerformanceMetric[] = [
  { label: 'Total Calls', value: 124, change: 12, trend: 'up' },
  { label: 'Avg. Call Score', value: '8.4', change: 0.5, trend: 'up' },
  { label: 'Transcribed', value: '98%', change: 2, trend: 'up' },
  { label: 'Action Items', value: 45, change: -5, trend: 'down' },
];

const recentCalls: SDRCall[] = [
  { 
    id: '1', 
    title: 'Initial Discovery - Acme Corp', 
    sdrName: 'John Doe', 
    status: 'completed', 
    duration: '15:20', 
    createdAt: '2024-05-15 10:30',
    score: 85,
    sentiment: 'positive'
  },
  { 
    id: '2', 
    title: 'Follow-up - Globex Inc', 
    sdrName: 'Jane Smith', 
    status: 'completed', 
    duration: '08:45', 
    createdAt: '2024-05-15 11:15',
    score: 72,
    sentiment: 'neutral'
  },
  { 
    id: '3', 
    title: 'Sales Pitch - Stark Ind', 
    sdrName: 'Mike Johnson', 
    status: 'processing', 
    duration: '22:10', 
    createdAt: '2024-05-15 14:00'
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Avaliação de Ligações SDR</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao VoiceInsights. Aqui está o resumo das suas atividades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  metric.trend === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(metric.change)}{metric.label.includes('%') ? '%' : ''}
                </div>
              </div>
              <p className="text-2xl font-headline font-bold mt-2">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas Ligações</CardTitle>
              <CardDescription>Ligações recentemente processadas e avaliadas.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/calls">Ver Todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      call.status === 'completed' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600 animate-pulse"
                    )}>
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{call.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{call.sdrName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{call.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {call.score && (
                      <Badge variant="outline" className="font-bold border-primary text-primary">
                        {call.score}/100
                      </Badge>
                    )}
                    <Button asChild size="icon" variant="ghost">
                      <Link href={`/dashboard/calls/${call.id}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por SDR</CardTitle>
            <CardDescription>Rank dos melhores desempenhos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'John Doe', score: 92, count: 24 },
                { name: 'Jane Smith', score: 88, count: 18 },
                { name: 'Mike Johnson', score: 85, count: 21 },
                { name: 'Sarah Wilson', score: 79, count: 15 },
              ].map((sdr, i) => (
                <div key={sdr.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm font-medium">{sdr.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{sdr.score}%</p>
                    <p className="text-[10px] text-muted-foreground">{sdr.count} ligações</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
