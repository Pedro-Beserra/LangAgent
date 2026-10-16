import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa os campos quando o modal abre ou altera de modo
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage(null);
      setPassword('');
    }
  }, [isAuthModalOpen, authMode]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === 'register' && !name.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Credenciais inválidas.');
        }
      } else {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Não foi possível criar a conta.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={closeAuthModal} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 transition-all">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="font-semibold text-slate-100 text-base">
              {authMode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas Alternadoras (Login / Cadastro) */}
        <div className="grid grid-cols-2 p-1.5 mx-5 mt-5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Nome ou Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Pelo menos 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : authMode === 'login' ? (
              'Entrar na Plataforma'
            ) : (
              'Cadastrar Conta'
            )}
          </button>
        </form>

        {/* Rodapé com dicas */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 text-center">
          <p className="text-xs text-slate-500">
            {authMode === 'login' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 cursor-pointer"
                >
                  Cadastre-se grátis
                </button>
              </>
            ) : (
              <>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 cursor-pointer"
                >
                  Fazer login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

