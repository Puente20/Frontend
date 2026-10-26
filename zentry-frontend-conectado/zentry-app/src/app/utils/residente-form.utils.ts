export function generarContrasenaSegura(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return Array.from(bytes, (byte) => caracteres[byte & 63]).join('');
}

export function componerTelefono(codigoPais: string, codigoArea: string, numeroLocal: string): string {
  const prefijoMovil = codigoPais === '54' ? '9' : '';
  return `+${codigoPais}${prefijoMovil}${codigoArea}${numeroLocal}`;
}
