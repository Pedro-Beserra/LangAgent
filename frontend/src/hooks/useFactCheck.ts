import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, FactCheckResult } from '../types';

const API_BASE_URL = 'http://localhost:8000';
const STORAGE_KEY = 'groq_api_key_override';

export function useFactCheck() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Salvar a chave na localStorage quando for alterada
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [apiKey]);

  const investigateClaim = useCallback(
    async (claimText: string) => {
      const trimmedClaim = claimText.trim();
      if (!trimmedClaim || isInvestigating) return;

      const userMessageId = `user-${Date.now()}`;
      const agentMessageId = `agent-${Date.now()}`;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Adiciona a pergunta do usuário e o placeholder do agente
      const userMessage: ChatMessage = {
        id: userMessageId,
        sender: 'user',
        claim: trimmedClaim,
        timestamp: now,
      };

      const initialAgentMessage: ChatMessage = {
        id: agentMessageId,
        sender: 'agent',
        claim: trimmedClaim,
        liveSteps: ['Iniciando protocolo de checagem...'],
        activeNode: 'planner',
        isLoading: true,
        timestamp: now,
      };

      setMessages((prev) => [...prev, userMessage, initialAgentMessage]);
      setIsInvestigating(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/check/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('finesse_auth_token')
              ? { Authorization: `Bearer ${localStorage.getItem('finesse_auth_token')}` }
              : {}),
          },
          body: JSON.stringify({
            claim: trimmedClaim,
            api_key: apiKey.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.detail?.message || `Erro no servidor (${response.status}): ${response.statusText}`
          );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('Não foi possível inicializar stream do servidor.');

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data:')) continue;

            const jsonStr = trimmedLine.replace(/^data:\s*/, '');
            try {
              const payload = JSON.parse(jsonStr);

              // 1. Atualização de nós (Planner, Researcher, Fact-Checker)
              if (payload.event === 'node_update') {
                const nodeName = payload.node;
                const updateData = payload.update || {};
                const newLogs: string[] = updateData.steps_log || [];
                const newSources = updateData.sources || [];
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== agentMessageId) return msg;
                    const currentResult = msg.result || {
                      claim: trimmedClaim,
                      verdict: 'Inconclusivo',
                      confidence: 'Baixa',
                      summary: '',
                      analysis: '',
                      sources: [],
                      steps_log: [],
                    };
                    return {
                      ...msg,
                      activeNode: nodeName,
                      liveSteps: [...(msg.liveSteps || []), ...newLogs],
                      result: {
                        ...currentResult,
                        verdict: updateData.verdict || currentResult.verdict,
                        confidence: updateData.confidence || currentResult.confidence,
                        summary: updateData.summary || currentResult.summary,
                        sources: [...currentResult.sources, ...newSources],
                      },
                    };
                  })
                );
              }
              
              if (payload.event === 'token') {
                const chunk: string = payload.content || '';
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== agentMessageId) return msg;
                    const currentResult = msg.result || {
                      claim: trimmedClaim,
                      verdict: 'Inconclusivo',
                      confidence: 'Baixa',
                      summary: '',
                      analysis: '',
                      sources: [],
                      steps_log: [],
                    };
                    return {
                      ...msg,
                      activeNode: 'fact_checker',
                      result: {
                        ...currentResult,
                        analysis: currentResult.analysis + chunk,
                      },
                    };
                  })
                );
              }

              // 2. Conclusão com sucesso
              if (payload.event === 'finished') {
                const finalState = payload.data as FactCheckResult;
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== agentMessageId) return msg;
                    return {
                      ...msg,
                      isLoading: false,
                      activeNode: undefined,
                      result: finalState,
                    };
                  })
                );
              }

              // 3. Erro reportado pelo stream
              if (payload.event === 'error') {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== agentMessageId) return msg;
                    return {
                      ...msg,
                      isLoading: false,
                      error: {
                        stage: payload.stage || 'geral',
                        message: payload.message || 'Erro durante a investigação.',
                        details: payload.details,
                      },
                    };
                  })
                );
              }
            } catch {
              // Fragmento JSON parcial
            }
          }
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== agentMessageId) return msg;
            return {
              ...msg,
              isLoading: false,
              error: {
                stage: 'conexao',
                message: err.message || 'Falha ao conectar com o backend em http://localhost:8000',
              },
            };
          })
        );
      } finally {
        setIsInvestigating(false);
      }
    },
    [apiKey, isInvestigating]
  );

  const clearMessages = () => setMessages([]);

  return {
    apiKey,
    setApiKey,
    messages,
    isInvestigating,
    investigateClaim,
    clearMessages,
  };
}
