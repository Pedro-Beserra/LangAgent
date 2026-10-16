import { AlertCircle } from 'lucide-react';
import type { ChatMessage } from '../types';
import { VerdictBadge } from './VerdictBadge';
import { SourcesList } from './SourcesList';
import { InvestigationSteps } from './InvestigationSteps';

interface MessageCardProps {
  message: ChatMessage;
}

export const MessageCard = ({ message }: MessageCardProps) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] md:max-w-[75%] bg-slate-800 text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700">
          <p className="text-sm leading-relaxed">{message.claim}</p>
          <span className="block text-[10px] text-slate-400 mt-1 text-right">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  // Resposta do Agente
  return (
    <div className="flex justify-start mb-6">
      <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Relatório de Checagem
            </span>
          </div>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>

        {/* Erro */}
        {message.error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Falha na etapa: {message.error.stage.toUpperCase()}</span>
            </div>
            <p className="text-rose-300">{message.error.message}</p>
            {message.error.details && (
              <pre className="mt-2 text-[10px] bg-slate-950 p-2 rounded text-slate-400 overflow-x-auto">
                {message.error.details}
              </pre>
            )}
          </div>
        )}

        {/* Rastreamento de passos em execução */}
        {message.liveSteps && message.liveSteps.length > 0 && (
          <InvestigationSteps
            steps={message.liveSteps}
            activeNode={message.activeNode}
            isLoading={message.isLoading}
          />
        )}

                {/* Resultado Progressivo / Consolidado */}
        {message.result && (
          <div className="space-y-4">
            {/* Só mostra o Badge e o Resumo quando o veredito final estiver pronto */}
            {message.result.summary && (
              <>
                <VerdictBadge
                  verdict={message.result.verdict}
                  confidence={message.result.confidence}
                />

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Resumo
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {message.result.summary}
                  </p>
                </div>
              </>
            )}

            {/* Análise Detalhada (aparece em tempo real conforme os tokens chegam!) */}
            {message.result.analysis && (
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Análise Fundamentada
                </h4>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {message.result.analysis}
                  {message.isLoading && (
                    <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-400 animate-pulse" />
                  )}
                </div>
              </div>
            )}

            {/* Fontes (aparecem assim que os nós pesquisadores terminam!) */}
            {message.result.sources.length > 0 && (
              <SourcesList sources={message.result.sources} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
