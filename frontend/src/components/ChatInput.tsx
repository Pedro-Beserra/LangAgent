import { useState, useRef, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  'O Brasil é o único país a participar de todas as Copas do Mundo?',
  'Albert Einstein ganhou o Prêmio Nobel pela Teoria da Relatividade?',
];

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleSelectSample = (question: string) => {
    setInput(question);
    requestAnimationFrame(() => adjustTextareaHeight(textareaRef.current));
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Apenas duas perguntas de exemplo em layout limpo (sem scrollbar horizontal) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Exemplos:</span>
        {SAMPLE_QUESTIONS.map((question, i) => (
          <button
            key={i}
            onClick={() => handleSelectSample(question)}
            disabled={isLoading}
            className="text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-1.5 text-left transition-all disabled:opacity-50 cursor-pointer"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Caixa de Entrada destacada e maior */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 md:p-4 shadow-2xl shadow-black/50 ring-1 ring-white/5 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
      >
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite a afirmação ou notícia que deseja auditar..."
            rows={1}
            disabled={isLoading}
            className="block w-full bg-transparent text-slate-100 placeholder-slate-400 text-base md:text-lg px-2 pt-1 pb-2 outline-none resize-none leading-normal disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 px-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Pressione Enter para enviar
            </span>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <span>Enviar</span>
                  <ArrowUp className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
