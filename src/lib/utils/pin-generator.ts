/**
 * Gera um PIN de 4 dígitos único para a sala
 */
export function generatePin(): string {
  // Gera número entre 1000 e 9999
  const pin = Math.floor(1000 + Math.random() * 9000);
  return pin.toString();
}

/**
 * Valida se o PIN tem formato correto
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Formata o PIN para exibição (ex: 1234)
 */
export function formatPin(pin: string): string {
  return pin.replace(/(\d{2})(\d{2})/, '$1 $2');
}
