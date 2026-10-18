import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import {
  User as UserIcon,
  Camera,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  X,
  Check,
  Loader2,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserCard = () => {
  const { user, updateAvatar, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoOption, setPhotoOption] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setPreviewUrl(user?.avatar_url || null);
    setUrlInput(user?.avatar_url || '');
    setImageError(false);
  }, [user?.avatar_url]);

  if (!user) return null;

  const handleOpenModal = () => {
    setPreviewUrl(user.avatar_url || null);
    setUrlInput(user.avatar_url || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setPreviewUrl(value.trim() ? value.trim() : null);
  };

  const handleResetToAnonymous = () => {
    setPreviewUrl(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAvatar(previewUrl);
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPhoto = Boolean(user.avatar_url) && !imageError;

  return (
    <>
      {/* Card Fixo no Canto Esquerdo (conforme o quadrado vermelho de referência) */}
      <aside
        aria-label="Perfil do Usuário"
        className="hidden lg:flex fixed left-4 xl:left-8 2xl:left-12 top-20 z-10 w-60 xl:w-64 flex-col items-center bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-2xl shadow-black/50 transition-all hover:border-slate-700/90"
      >
        {/* Status Online */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Perfil
          </span>
        </div>

        {/* 1. Foto do Usuário (Anônima por padrão ou Personalizada com opção de alterar) */}
        <div
          onClick={handleOpenModal}
          className="relative group cursor-pointer"
          title="Clique para alterar a foto de perfil"
        >
          {hasPhoto ? (
            <img
              src={user.avatar_url!}
              alt={user.name}
              onError={() => setImageError(true)}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30 group-hover:ring-indigo-500/60 transition-all shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800/90 border-2 border-slate-700/80 text-slate-300 flex flex-col items-center justify-center shadow-inner group-hover:border-indigo-500/60 transition-all">
              <UserIcon className="w-9 h-9 text-slate-400 group-hover:text-slate-200 transition-colors" />
              <span className="text-[9px] text-slate-500 font-medium tracking-tight mt-0.5">
                Anônima
              </span>
            </div>
          )}

          {/* Overlay suave com ícone de câmera no hover */}
          <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <Camera className="w-5 h-5 text-indigo-300" />
            <span className="text-[9px] font-medium text-slate-200 mt-0.5">Alterar</span>
          </div>

          {/* Botão flutuante da câmera */}
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center shadow-md">
            <Camera className="w-3 h-3 text-white" />
          </span>
        </div>

        {/* 2. Nome do Usuário (Hierarquia Primária) com Símbolo de Verificado */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 w-full px-2">
          <h3
            className="text-base font-semibold text-slate-100 tracking-tight truncate text-center"
            title={user.name}
          >
            {user.name}
          </h3>
          <span title="Conta Verificada" className="flex items-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        {/* 3. E-mail do Usuário (Hierarquia Secundária) */}
        <p
          className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-[210px] text-center"
          title={user.email}
        >
          {user.email}
        </p>

        {/* Ações: Alterar Foto e Sair */}
        <div className="w-full mt-4 space-y-1.5">
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inserir / Alterar Foto</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-medium rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Botão flutuante em telas menores (< lg) para abrir o perfil */}
      <button
        type="button"
        onClick={() => setIsMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 z-20 flex items-center gap-2 py-2 px-3 rounded-full bg-slate-900/95 border border-slate-700 shadow-xl shadow-black/60 text-slate-200 hover:border-indigo-500 transition-all cursor-pointer text-xs font-medium"
        title="Ver Perfil"
      >
        <UserIcon className="w-4 h-4 text-indigo-400" />
        <span>Perfil</span>
      </button>

      {/* Modal/Drawer de Perfil em Telas Pequenas (< lg) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="relative w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl z-10 flex flex-col items-center">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Foto */}
            <div
              onClick={() => {
                setIsMobileDrawerOpen(false);
                handleOpenModal();
              }}
              className="relative group cursor-pointer mt-2"
            >
              {hasPhoto ? (
                <img
                  src={user.avatar_url!}
                  alt={user.name}
                  onError={() => setImageError(true)}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <UserIcon className="w-7 h-7" />
                  <span className="text-[8px] text-slate-500">Anônima</span>
                </div>
              )}
            </div>

            {/* Nome & Verificado */}
            <div className="mt-3 flex items-center justify-center gap-1.5 w-full">
              <h3 className="text-sm font-semibold text-slate-100 truncate">{user.name}</h3>
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>

            {/* Email */}
            <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{user.email}</p>

            {/* Ações */}
            <div className="w-full mt-4 space-y-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleOpenModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alterar Foto</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-slate-400 hover:text-rose-400 text-xs font-medium rounded-xl cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Inserir / Alterar Foto ou Restaurar Padrão Anônimo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={handleCloseModal} />

          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 transition-all p-5 space-y-4">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Foto de Perfil do Usuário
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview da Foto */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                    <UserIcon className="w-8 h-8 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Anônima</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 text-center">
                {previewUrl ? 'Foto selecionada' : 'Foto atual: Anônima (Padrão)'}
              </p>
            </div>

            {/* Abas: Upload do Computador ou Inserir URL */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800/80 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPhotoOption('upload')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  photoOption === 'upload'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoOption('url')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  photoOption === 'url'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link / URL</span>
              </button>
            </div>

            {/* Conteúdo conforme a aba escolhida */}
            {photoOption === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Escolher imagem do dispositivo</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Formatos suportados: PNG, JPG ou WebP (máx. 3MB)
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">URL da Imagem</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Botão de Restaurar Padrão Anônimo */}
            {previewUrl && (
              <button
                type="button"
                onClick={handleResetToAnonymous}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 py-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar foto anônima padrão</span>
              </button>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="flex-1 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Foto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};