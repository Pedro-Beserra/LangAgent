import { Loader2 } from 'lucide-react';

interface InvestigationStepsProps {
  steps: string[];
  activeNode?: string;
  isLoading?: boolean;
}

const NODE_LABELS: Record<string, string> = {
  planner: 'Planejamento Estratégico',
  wiki_researcher: 'Agente Wikipédia',
  web_researcher: 'Agente Notícias Web',
  fact_checker: 'Auditoria e Veredito',
};

export const InvestigationSteps = ({
  steps,
  activeNode,
  isLoading,
}: InvestigationStepsProps) => {
  if (!steps || steps.length === 0) return null;

  const currentLabel = activeNode ? (NODE_LABELS[activeNode] || activeNode) : 'processando';

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 my-2 text-xs font-mono">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-sans font-medium">
          Rastreamento de Execução
        </span>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-indigo-400 text-[11px]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Executando: {currentLabel}</span>
          </div>
        )}
      </div>

      <div className="space-y-1 text-slate-400">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-600 select-none">{String(idx + 1).padStart(2, '0')}.</span>
            <span className="leading-relaxed">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
