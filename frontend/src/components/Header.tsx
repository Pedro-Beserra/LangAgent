import { Trash2, LogIn, LogOut } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onClearHistory: () => void;
  hasMessages: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const Header = ({
  onClearHistory,
  hasMessages,
  apiKey,
  onApiKeyChange,
}: HeaderProps) => {
  const { isAuthenticated, logout, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Identidade / Marca no Canto Esquerdo do Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          <h1 className="text-base font-semibold tracking-tight text-slate-100">
            Finesse Checking
          </h1>
        </div>

        {/* Canto Direito: Chave Groq + Botão Entrar ou Sair + Botão Limpar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ApiKeyInput apiKey={apiKey} onApiKeyChange={onApiKeyChange} />

          {/* Estado de Autenticação */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-100 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-500/20"
              title="Acessar sua conta"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {hasMessages && (
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Limpar histórico"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
