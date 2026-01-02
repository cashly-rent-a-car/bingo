import { BingoCard, BingoBall } from '@/types/game';
import { findNumberPosition } from './card-generator';

/**
 * Valida se um número pode ser marcado
 */
export function validateMarkNumber(
  card: BingoCard,
  number: number,
  drawnBalls: BingoBall[]
): { valid: boolean; error?: string; position?: { row: number; col: number } } {
  // Verifica se o número foi sorteado
  const wasDrawn = drawnBalls.some(ball => ball.number === number);
  if (!wasDrawn) {
    return { valid: false, error: 'Número ainda não foi sorteado' };
  }

  // Verifica se o número está na cartela
  const position = findNumberPosition(card, number);
  if (!position) {
    return { valid: false, error: 'Número não está na sua cartela' };
  }

  // Verifica se já foi marcado
  if (card.cells[position.row][position.col].isMarked) {
    return { valid: false, error: 'Número já foi marcado' };
  }

  return { valid: true, position };
}

/**
 * Valida se o jogador pode clamar uma linha
 */
export function validateClaimLine(
  card: BingoCard,
  lineType: 'row' | 'column' | 'diagonal',
  lineIndex: number
): { valid: boolean; error?: string } {
  let cells: { isMarked: boolean }[] = [];

  switch (lineType) {
    case 'row':
      if (lineIndex < 0 || lineIndex > 4) {
        return { valid: false, error: 'Índice de linha inválido' };
      }
      cells = card.cells[lineIndex];
      break;

    case 'column':
      if (lineIndex < 0 || lineIndex > 4) {
        return { valid: false, error: 'Índice de coluna inválido' };
      }
      cells = card.cells.map(row => row[lineIndex]);
      break;

    case 'diagonal':
      if (lineIndex !== 0 && lineIndex !== 1) {
        return { valid: false, error: 'Índice de diagonal inválido' };
      }
      cells = lineIndex === 0
        ? [0, 1, 2, 3, 4].map(i => card.cells[i][i])
        : [0, 1, 2, 3, 4].map(i => card.cells[i][4 - i]);
      break;
  }

  const allMarked = cells.every(cell => cell.isMarked);
  if (!allMarked) {
    return { valid: false, error: 'Linha não está completa' };
  }

  return { valid: true };
}

/**
 * Valida se o jogador pode clamar BINGO
 */
export function validateClaimBingo(card: BingoCard): { valid: boolean; error?: string } {
  const allMarked = card.cells.every(row => row.every(cell => cell.isMarked));

  if (!allMarked) {
    return { valid: false, error: 'Cartela não está completa' };
  }

  return { valid: true };
}
