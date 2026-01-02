// Tipos principais do jogo de Bingo

export type BingoColumn = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoCell {
  number: number | null; // null = FREE space
  column: BingoColumn;
  isMarked: boolean;
  isFreeSpace: boolean;
}

export interface BingoCard {
  id: string;
  playerId: string;
  cells: BingoCell[][]; // [row][col] - 5x5 grid
  generatedAt: number;
}

export interface BingoBall {
  number: number; // 1-75
  column: BingoColumn;
  drawnAt: number;
  drawnIndex: number;
}

export interface CompletedLine {
  type: 'row' | 'column' | 'diagonal';
  index: number; // 0-4 para row/col, 0-1 para diagonal
  completedAt: number;
  bonusAwarded: number;
}

export interface RankingEntry {
  playerId: string;
  playerName: string;
  avatarId: string;
  score: number;
  linesCompleted: number;
  position: number;
  previousPosition: number;
}

export interface GameState {
  drawnBalls: BingoBall[];
  remainingBalls: number[];
  currentBall: BingoBall | null;
  ranking: RankingEntry[];
  startedAt: number;
  endedAt: number | null;
  winnerId: string | null;
}

export type GamePhase = 'lobby' | 'playing' | 'ended';

// Constantes do Bingo 75
export const BINGO_COLUMNS: Record<BingoColumn, { min: number; max: number }> = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

export const COLUMN_ORDER: BingoColumn[] = ['B', 'I', 'N', 'G', 'O'];

export const LINE_BONUS_POINTS = 5;  // Bônus por completar linha/coluna (diagonal não dá bônus)
export const NUMBER_POINTS = 1;     // Pontos por cada número marcado
