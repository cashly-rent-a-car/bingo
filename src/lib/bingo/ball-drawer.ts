import { BingoBall } from '@/types/game';
import { getColumnForNumber } from './card-generator';

/**
 * Cria o conjunto inicial de 75 bolas
 */
export function createBallPool(): number[] {
  return Array.from({ length: 75 }, (_, i) => i + 1);
}

/**
 * Embaralha as bolas para sorteio
 */
export function shuffleBalls(balls: number[]): number[] {
  const shuffled = [...balls];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sorteia a próxima bola do pool
 */
export function drawNextBall(
  remainingBalls: number[],
  drawnIndex: number
): { ball: BingoBall; remaining: number[] } | null {
  if (remainingBalls.length === 0) {
    return null;
  }

  const remaining = [...remainingBalls];
  const number = remaining.shift()!;

  const ball: BingoBall = {
    number,
    column: getColumnForNumber(number),
    drawnAt: Date.now(),
    drawnIndex,
  };

  return { ball, remaining };
}

/**
 * Verifica se um número já foi sorteado
 */
export function isBallDrawn(drawnBalls: BingoBall[], number: number): boolean {
  return drawnBalls.some(ball => ball.number === number);
}

/**
 * Agrupa bolas sorteadas por coluna para exibição
 */
export function groupBallsByColumn(
  drawnBalls: BingoBall[]
): Record<string, number[]> {
  const grouped: Record<string, number[]> = {
    B: [],
    I: [],
    N: [],
    G: [],
    O: [],
  };

  for (const ball of drawnBalls) {
    grouped[ball.column].push(ball.number);
  }

  // Ordena cada coluna
  Object.keys(grouped).forEach(col => {
    grouped[col].sort((a, b) => a - b);
  });

  return grouped;
}
