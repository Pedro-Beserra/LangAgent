export type VerdictType = 'Verdadeiro' | 'Falso' | 'Parcialmente Verdadeiro' | 'Inconclusivo';
export type ConfidenceType = 'Alta' | 'Média' | 'Baixa';

export interface SourceItem {
  title: string;
  url: string;
  snippet: string;
  source: 'Wikipedia' | 'Web' | string;
}

export interface FactCheckResult {
  claim: string;
  verdict: VerdictType;
  confidence: ConfidenceType;
  summary: string;
  analysis: string;
  sources: SourceItem[];
  steps_log: string[];
}

export interface InvestigationLiveStep {
  node: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  claim?: string;
  result?: FactCheckResult;
  liveSteps?: string[];
  activeNode?: string;
  isLoading?: boolean;
  error?: {
    stage: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
}

