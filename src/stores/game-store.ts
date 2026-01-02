import { create } from 'zustand';
import type { RoomState, Player } from '@/types/room';
import type { BingoCard, BingoBall, RankingEntry, GamePhase } from '@/types/game';

interface GameStore {
  // Estado da sala
  roomState: RoomState | null;
  setRoomState: (state: RoomState) => void;

  // Jogador atual
  currentPlayerId: string | null;
  setCurrentPlayerId: (id: string) => void;
  getCurrentPlayer: () => Player | null;

  // Cartela do jogador
  myCard: BingoCard | null;
  setMyCard: (card: BingoCard) => void;

  // Bolas sorteadas
  drawnBalls: BingoBall[];
  currentBall: BingoBall | null;
  addDrawnBall: (ball: BingoBall) => void;
  setDrawnBalls: (balls: BingoBall[]) => void;

  // Ranking
  ranking: RankingEntry[];
  setRanking: (ranking: RankingEntry[]) => void;

  // Estado do jogo
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;

  // Jogadores
  players: Record<string, Player>;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerAvatar: (playerId: string, avatarId: string) => void;
  setPlayerConnected: (playerId: string, isConnected: boolean) => void;

  // Conexão
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Host
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  roomState: null,
  currentPlayerId: null,
  myCard: null,
  drawnBalls: [],
  currentBall: null,
  ranking: [],
  gamePhase: 'lobby' as GamePhase,
  players: {},
  isConnected: false,
  isHost: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setRoomState: (state) =>
    set({
      roomState: state,
      players: state.players,
      gamePhase: state.gamePhase,
      drawnBalls: state.game?.drawnBalls || [],
      currentBall: state.game?.currentBall || null,
      ranking: state.game?.ranking || [],
    }),

  currentPlayerId: null,
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),

  getCurrentPlayer: () => {
    const { currentPlayerId, players } = get();
    return currentPlayerId ? players[currentPlayerId] || null : null;
  },

  setMyCard: (card) => set({ myCard: card }),

  addDrawnBall: (ball) =>
    set((state) => ({
      drawnBalls: [...state.drawnBalls, ball],
      currentBall: ball,
    })),

  setDrawnBalls: (balls) =>
    set({
      drawnBalls: balls,
      currentBall: balls.length > 0 ? balls[balls.length - 1] : null,
    }),

  setRanking: (ranking) => set({ ranking }),

  setGamePhase: (phase) => set({ gamePhase: phase }),

  addPlayer: (player) =>
    set((state) => ({
      players: { ...state.players, [player.id]: player },
    })),

  removePlayer: (playerId) =>
    set((state) => {
      const { [playerId]: _, ...rest } = state.players;
      return { players: rest };
    }),

  updatePlayerAvatar: (playerId, avatarId) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: { ...state.players[playerId], avatarId },
      },
    })),

  setPlayerConnected: (playerId, isConnected) =>
    set((state) => {
      if (!state.players[playerId]) return state;
      return {
        players: {
          ...state.players,
          [playerId]: { ...state.players[playerId], isConnected },
        },
      };
    }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setIsHost: (isHost) => set({ isHost }),

  reset: () => set(initialState),
}));
