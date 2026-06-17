/**
 * Formata uma string para a máscara de CPF (999.999.999-99).
 */
export function formatCPF(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 0) return "";
  
  const part1 = clean.slice(0, 3);
  const part2 = clean.slice(3, 6);
  const part3 = clean.slice(6, 9);
  const part4 = clean.slice(9, 11);

  if (clean.length <= 3) {
    return part1;
  }
  if (clean.length <= 6) {
    return `${part1}.${part2}`;
  }
  if (clean.length <= 9) {
    return `${part1}.${part2}.${part3}`;
  }
  return `${part1}.${part2}.${part3}-${part4}`;
}

/**
 * Formata uma string para a máscara de data no formato brasileiro (DD/MM/AAAA).
 */
export function formatDateBR(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 0) return "";

  const day = clean.slice(0, 2);
  const month = clean.slice(2, 4);
  const year = clean.slice(4, 8);

  if (clean.length <= 2) {
    return day;
  }
  if (clean.length <= 4) {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${year}`;
}

/**
 * Formata um número de telefone brasileiro dinamicamente.
 * Suporta fixo (99) 9999-9999 (10 dígitos) e celular (99) 99999-9999 (11 dígitos).
 */
export function formatPhoneBR(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 0) return "";

  const ddd = clean.slice(0, 2);
  const part1 = clean.slice(2, 6);
  const part2 = clean.slice(6, 10);
  
  if (clean.length <= 2) {
    return `(${ddd}`;
  }
  if (clean.length <= 6) {
    return `(${ddd}) ${part1}`;
  }
  
  if (clean.length <= 10) {
    return `(${ddd}) ${part1}-${part2}`;
  }
  
  // Para celular (11 dígitos): (99) 99999-9999
  const part1Cell = clean.slice(2, 7);
  const part2Cell = clean.slice(7, 11);
  return `(${ddd}) ${part1Cell}-${part2Cell}`;
}

/**
 * Formata um RG brasileiro padrão (99.999.999-9 ou 99.999.999-X).
 */
export function formatRG(value: string): string {
  const clean = value.replace(/[^0-9Xx]/g, "");
  if (clean.length === 0) return "";

  const part1 = clean.slice(0, 2);
  const part2 = clean.slice(2, 5);
  const part3 = clean.slice(5, 8);
  const part4 = clean.slice(8, 9);

  if (clean.length <= 2) {
    return part1;
  }
  if (clean.length <= 5) {
    return `${part1}.${part2}`;
  }
  if (clean.length <= 8) {
    return `${part1}.${part2}.${part3}`;
  }
  return `${part1}.${part2}.${part3}-${part4.toUpperCase()}`;
}
