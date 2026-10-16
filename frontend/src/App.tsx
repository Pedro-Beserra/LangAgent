import { useRef, useEffect } from 'react';
import { useFactCheck } from './hooks/useFactCheck';
import { Header } from './components/Header';
import { MessageCard } from './components/MessageCard';
import { ChatInput } from './components/ChatInput';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export function App() {
  const {
    apiKey,
    setApiKey,
    messages,
    isInvestigating,
    investigateClaim,
    clearMessages,
  } = useFactCheck();

  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-slate-700 selection:text-white">
      {/* Modal de Login e Registro */}
      <AuthModal />

      {/* Barra Superior com API Key compacta e Autenticação */}
      <Header
        onClearHistory={clearMessages}
        hasMessages={messages.length > 0}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {messages.length === 0 ? (
          // Tela Inicial Limpa e Direta
          <div className="my-auto text-center max-w-xl mx-auto py-16 space-y-3">
            {user && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-900/50 text-indigo-300 text-xs font-medium mb-1 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Conectado como {user.name}</span>
              </div>
            )}
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
              Checagem de Fatos e Evidências
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consulte afirmações para verificação automática cruzando Wikipédia e notícias recentes via busca na Web.
            </p>
          </div>
        ) : (
          // Histórico de Checagens
          <div className="flex-1 py-4">
            {messages.map((msg) => (
              <MessageCard key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Caixa de Entrada Ocupando Toda a Largura */}
      <footer className="sticky bottom-0 z-10 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80">
        <ChatInput
          onSendMessage={investigateClaim}
          isLoading={isInvestigating}
        />
      </footer>
    </div>
  );
}

export default App;
