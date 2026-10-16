import { ExternalLink } from 'lucide-react';
import type { SourceItem } from '../types';

interface SourcesListProps {
  sources: SourceItem[];
}

export const SourcesList = ({ sources }: SourcesListProps) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="text-xs text-slate-500 py-1">
        Nenhuma fonte externa encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate-800/80">
      <div className="text-xs font-medium text-slate-400">
        Fontes Consultadas ({sources.length})
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sources.map((source, index) => (
          <div
            key={index}
            className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between text-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-slate-200 truncate">
                  {source.title}
                </span>
                <span className="text-[10px] text-slate-400 uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  {source.source}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] line-clamp-3 leading-relaxed">
                {source.snippet}
              </p>
            </div>

            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-2 pt-1.5 border-t border-slate-900"
              >
                <span>Acessar fonte</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
