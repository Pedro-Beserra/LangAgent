import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
      <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Chave Groq (opcional)"
          className="w-36 md:w-44 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none pr-5 font-mono"
          title="Chave de API da Groq (gsk_...). Fica armazenada localmente."
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
          title={showKey ? "Ocultar chave" : "Exibir chave"}
        >
          {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>

      {apiKey ? (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">Definida</span>
        </span>
      ) : (
        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded hidden sm:inline">
          Não definida
        </span>
      )}
    </div>
  );
};
