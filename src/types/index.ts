
export type CallStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SDRCall {
  id: string;
  title: string;
  sdrName: string;
  status: CallStatus;
  duration: string;
  createdAt: string;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
