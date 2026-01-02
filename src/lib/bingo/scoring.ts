import { BingoCard, CompletedLine, LINE_BONUS_POINTS, NUMBER_POINTS } from '@/types/game';

/**
 * Calcula a pontuação por marcar um número
 */
export function getPointsForNumber(): number {
  return NUMBER_POINTS;
}

/**
 * Calcula o bônus por completar uma linha
 */
export function getLineBonus(): number {
  return LINE_BONUS_POINTS;
}

/**
 * Verifica se uma linha horizontal está completa
 */
export function isRowComplete(card: BingoCard, rowIndex: number): boolean {
  return card.cells[rowIndex].every(cell => cell.isMarked);
}

/**
 * Verifica se uma coluna está completa
 */
export function isColumnComplete(card: BingoCard, colIndex: number): boolean {
  return card.cells.every(row => row[colIndex].isMarked);
}

/**
 * Verifica se uma diagonal está completa
 * diagonalIndex: 0 = principal (↘), 1 = secundária (↙)
 */
export function isDiagonalComplete(card: BingoCard, diagonalIndex: number): boolean {
  if (diagonalIndex === 0) {
    // Diagonal principal: (0,0), (1,1), (2,2), (3,3), (4,4)
    return [0, 1, 2, 3, 4].every(i => card.cells[i][i].isMarked);
  } else {
    // Diagonal secundária: (0,4), (1,3), (2,2), (3,1), (4,0)
    return [0, 1, 2, 3, 4].every(i => card.cells[i][4 - i].isMarked);
  }
}

/**
 * Encontra todas as linhas recém-completadas após marcar um número
 */
export function findNewlyCompletedLines(
  card: BingoCard,
  markedPosition: { row: number; col: number },
  alreadyCompleted: CompletedLine[]
): CompletedLine[] {
  const newLines: CompletedLine[] = [];
  const { row, col } = markedPosition;

  // Verifica linha horizontal
  if (isRowComplete(card, row)) {
    const alreadyHas = alreadyCompleted.some(
      l => l.type === 'row' && l.index === row
    );
    if (!alreadyHas) {
      newLines.push({
        type: 'row',
        index: row,
        completedAt: Date.now(),
        bonusAwarded: LINE_BONUS_POINTS,
      });
    }
  }

  // Verifica coluna
  if (isColumnComplete(card, col)) {
    const alreadyHas = alreadyCompleted.some(
      l => l.type === 'column' && l.index === col
    );
    if (!alreadyHas) {
      newLines.push({
        type: 'column',
        index: col,
        completedAt: Date.now(),
        bonusAwarded: LINE_BONUS_POINTS,
      });
    }
  }

  // Diagonais não dão bônus - apenas linhas e colunas

  return newLines;
}

/**
 * Verifica se a cartela está completa (BINGO!)
 */
export function isCardComplete(card: BingoCard): boolean {
  return card.cells.every(row => row.every(cell => cell.isMarked));
}

/**
 * Calcula pontuação total de um jogador
 */
export function calculateTotalScore(
  markedCount: number,
  completedLines: CompletedLine[]
): number {
  const numberPoints = markedCount * NUMBER_POINTS;
  const lineBonus = completedLines.reduce((sum, line) => sum + line.bonusAwarded, 0);
  return numberPoints + lineBonus;
}
