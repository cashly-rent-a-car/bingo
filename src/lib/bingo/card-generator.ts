import { BingoCard, BingoCell, BingoColumn, BINGO_COLUMNS, COLUMN_ORDER } from '@/types/game';

/**
 * Gera uma cartela de Bingo válida seguindo as regras do Bingo 75
 * - Coluna B: números 1-15
 * - Coluna I: números 16-30
 * - Coluna N: números 31-45 (com FREE space no centro)
 * - Coluna G: números 46-60
 * - Coluna O: números 61-75
 */
export function generateBingoCard(playerId: string): BingoCard {
  const cells: BingoCell[][] = [];

  // Para cada linha (0-4)
  for (let row = 0; row < 5; row++) {
    const rowCells: BingoCell[] = [];

    // Para cada coluna (B, I, N, G, O)
    for (let col = 0; col < 5; col++) {
      const column = COLUMN_ORDER[col];
      const isFreeSpace = row === 2 && col === 2; // Centro da cartela

      rowCells.push({
        number: isFreeSpace ? null : 0, // Será preenchido depois
        column,
        isMarked: isFreeSpace, // FREE space já começa marcado
        isFreeSpace,
      });
    }

    cells.push(rowCells);
  }

  // Gera números únicos para cada coluna
  COLUMN_ORDER.forEach((column, colIndex) => {
    const { min, max } = BINGO_COLUMNS[column];
    const availableNumbers = shuffleArray(
      Array.from({ length: max - min + 1 }, (_, i) => min + i)
    );

    // Preenche as 5 células da coluna (exceto FREE space)
    let numberIndex = 0;
    for (let row = 0; row < 5; row++) {
      if (!cells[row][colIndex].isFreeSpace) {
        cells[row][colIndex].number = availableNumbers[numberIndex];
        numberIndex++;
      }
    }
  });

  return {
    id: generateCardId(),
    playerId,
    cells,
    generatedAt: Date.now(),
  };
}

/**
 * Embaralha um array usando Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gera um ID único para a cartela
 */
function generateCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica se um número está na cartela
 */
export function isNumberInCard(card: BingoCard, number: number): boolean {
  for (const row of card.cells) {
    for (const cell of row) {
      if (cell.number === number) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Encontra a posição de um número na cartela
 */
export function findNumberPosition(
  card: BingoCard,
  number: number
): { row: number; col: number } | null {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (card.cells[row][col].number === number) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Retorna a coluna correta para um número
 */
export function getColumnForNumber(number: number): BingoColumn {
  if (number >= 1 && number <= 15) return 'B';
  if (number >= 16 && number <= 30) return 'I';
  if (number >= 31 && number <= 45) return 'N';
  if (number >= 46 && number <= 60) return 'G';
  return 'O';
}
