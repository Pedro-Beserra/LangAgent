import type { VerdictType, ConfidenceType } from '../types';

interface VerdictBadgeProps {
  verdict: VerdictType;
  confidence?: ConfidenceType;
}

export const VerdictBadge = ({ verdict, confidence }: VerdictBadgeProps) => {
  const getBadgeStyle = () => {
    switch (verdict) {
      case 'Verdadeiro':
        return {
          pill: 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300',
          dot: 'bg-emerald-400',
        };
      case 'Falso':
        return {
          pill: 'bg-rose-950/50 border-rose-800/80 text-rose-300',
          dot: 'bg-rose-400',
        };
      case 'Parcialmente Verdadeiro':
        return {
          pill: 'bg-amber-950/50 border-amber-800/80 text-amber-300',
          dot: 'bg-amber-400',
        };
      case 'Inconclusivo':
      default:
        return {
          pill: 'bg-slate-900 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const { pill, dot } = getBadgeStyle();

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-semibold tracking-wider uppercase ${pill}`}>
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span>Veredito: {verdict}</span>
      </div>

      {confidence && (
        <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
          Confiança: <strong className="text-slate-200">{confidence}</strong>
        </span>
      )}
    </div>
  );
};
