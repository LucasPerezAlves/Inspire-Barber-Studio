/**
 * Sanitização defensiva de inputs de texto.
 *
 * Não depende do DOM (funciona em Edge Runtime / Node.js).
 * Neutraliza tags HTML e atributos javascript: antes de armazenar
 * ou exibir dados vindos do usuário.
 */

/** Remove toda tag HTML e escapa os caracteres especiais restantes. */
export function sanitizeText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]*>/g, "")          // strips HTML tags
    .replace(/javascript:/gi, "")     // neutraliza hrefs maliciosos
    .replace(/on\w+\s*=/gi, "")       // remove event handlers inline
    .trim()
    .slice(0, 512);                    // comprimento máximo defensivo
}

/** Normaliza e-mail: lowercase + trim + sem tags. */
export function sanitizeEmail(raw: unknown): string {
  return sanitizeText(raw).toLowerCase();
}

/** Extrai apenas dígitos de um número de telefone. */
export function sanitizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\D/g, "").slice(0, 15);
}

/** Garante que o slug só contém caracteres seguros: a-z, 0-9, hífen. */
export function sanitizeSlug(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 64);
}
