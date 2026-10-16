import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'finesse_auth_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Ao carregar a página, se houver token, busca os dados do usuário autenticado
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          // Token inválido ou expirado
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao validar sessão do usuário:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.detail || 'Falha ao autenticar.' };
      }

      const authData = data as AuthResponse;
      localStorage.setItem(TOKEN_KEY, authData.token);
      setToken(authData.token);
      setUser(authData.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.detail || 'Falha ao criar conta.' };
      }

      const authData = data as AuthResponse;
      localStorage.setItem(TOKEN_KEY, authData.token);
      setToken(authData.token);
      setUser(authData.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

