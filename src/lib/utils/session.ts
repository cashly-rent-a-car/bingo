// Gerenciamento de sessões no cliente
// Session Token: identifica o jogador de forma persistente entre conexões
// Tab ID: identifica a aba específica (útil para múltiplas abas)

export interface StoredSession {
  sessionToken: string;
  playerName: string;
  avatarId: string;
  isHost: boolean;
  createdAt: number;
  lastActiveAt: number;
}

/**
 * Gera um UUID v4 com fallback para browsers que não suportam crypto.randomUUID()
 * (ex: browsers mobile antigos, contextos não-HTTPS)
 */
function generateUUID(): string {
  // Usa crypto.randomUUID() se disponível (mais seguro)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: gera UUID v4 usando Math.random()
  // Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gera um token de sessão único
 */
export function generateSessionToken(): string {
  return generateUUID();
}

/**
 * Recupera sessão salva no localStorage para uma sala específica
 * @param roomId - PIN da sala
 * @returns Sessão armazenada ou null se não existir
 */
export function getStoredSession(roomId: string): StoredSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(`bingo_session_${roomId}`);
    if (!data) return null;

    const session = JSON.parse(data) as StoredSession;

    // Valida que tem os campos obrigatórios
    if (!session.sessionToken) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * Salva sessão no localStorage
 * @param roomId - PIN da sala
 * @param session - Dados da sessão a salvar
 */
export function storeSession(roomId: string, session: StoredSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`bingo_session_${roomId}`, JSON.stringify(session));
  } catch (e) {
    console.error('[SESSION] Failed to store session:', e);
  }
}

/**
 * Atualiza apenas o lastActiveAt da sessão existente
 * @param roomId - PIN da sala
 */
export function updateSessionActivity(roomId: string): void {
  const session = getStoredSession(roomId);
  if (session) {
    session.lastActiveAt = Date.now();
    storeSession(roomId, session);
  }
}

/**
 * Remove sessão do localStorage e sessionStorage
 * @param roomId - PIN da sala
 */
export function clearSession(roomId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`bingo_session_${roomId}`);
    sessionStorage.removeItem(`bingo_tab_${roomId}`);
    // Também remove o playerId antigo se existir
    localStorage.removeItem(`bingo_player_${roomId}`);
  } catch (e) {
    console.error('[SESSION] Failed to clear session:', e);
  }
}

/**
 * Gera ou recupera um Tab ID único por aba
 * Persiste no sessionStorage (limpa quando fecha a aba)
 * @param roomId - PIN da sala
 * @returns Tab ID único
 */
export function getOrCreateTabId(roomId: string): string {
  if (typeof window === 'undefined') return generateUUID();

  const key = `bingo_tab_${roomId}`;
  let tabId = sessionStorage.getItem(key);

  if (!tabId) {
    tabId = generateUUID();
    sessionStorage.setItem(key, tabId);
  }

  return tabId;
}

/**
 * Limpa sessões expiradas (mais de 24 horas)
 * Deve ser chamada no início da aplicação
 */
export function cleanExpiredSessions(): void {
  if (typeof window === 'undefined') return;

  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
  const now = Date.now();

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bingo_session_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const session = JSON.parse(data) as StoredSession;
            if (now - session.createdAt > MAX_AGE) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // JSON inválido, remove
          keysToRemove.push(key);
        }
      }
    }

    // Remove as chaves coletadas
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      // Também remove o playerId associado
      const roomId = key.replace('bingo_session_', '');
      localStorage.removeItem(`bingo_player_${roomId}`);
    });

    if (keysToRemove.length > 0) {
      console.log('[SESSION] Cleaned', keysToRemove.length, 'expired sessions');
    }
  } catch (e) {
    console.error('[SESSION] Failed to clean expired sessions:', e);
  }
}

/**
 * Verifica se uma sessão existe e é válida para uma sala
 * @param roomId - PIN da sala
 * @returns true se existe sessão válida
 */
export function hasValidSession(roomId: string): boolean {
  const session = getStoredSession(roomId);
  if (!session) return false;

  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
  const now = Date.now();

  return now - session.createdAt < MAX_AGE;
}
