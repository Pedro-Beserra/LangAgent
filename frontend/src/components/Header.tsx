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
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  // Iniciais do nome do usuário para o avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Identidade */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-100">
              Finesse Checking
            </h2>
          </div>
        </div>

        {/* Ações: Chave Groq + Autenticação + Botão Limpar */}
        <div className="flex items-center gap-2.5">
          <ApiKeyInput apiKey={apiKey} onApiKeyChange={onApiKeyChange} />

          {/* Estado de Autenticação */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1 px-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-[10px] flex items-center justify-center">
                {getInitials(user.name)}
              </div>
              <span className="text-xs text-slate-200 font-medium hidden sm:inline max-w-[100px] truncate" title={user.name}>
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
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
