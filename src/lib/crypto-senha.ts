/**
 * crypto-senha.ts
 * Hashing e verificação de senhas via Node.js nativo (scrypt + timingSafeEqual).
 *
 * Este arquivo usa módulos exclusivos do Node.js Runtime ('crypto', 'util').
 * NÃO importe aqui a partir do middleware nem de qualquer arquivo que rode
 * no Edge Runtime — use apenas em Route Handlers (app/api/*) e Server Actions.
 *
 * Segurança:
 *   · scrypt é memory-hard: resistente a ataques de GPU/ASIC.
 *   · timingSafeEqual previne timing-attacks na comparação de hashes.
 *   · Salt aleatório de 16 bytes garante que hashes iguais nunca se repitam.
 */
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/** Retorna "salt_hex:hash_hex" para armazenar no banco. */
export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(senha, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

/**
 * Compara uma senha em texto puro com o valor armazenado ("salt:hash").
 * timingSafeEqual mantém o tempo de execução constante mesmo quando
 * o hash não bate, impedindo a extração de informação via timing.
 */
export async function verificarSenha(
  senha:      string,
  armazenado: string,
): Promise<boolean> {
  try {
    const [salt, hashHex] = armazenado.split(":");
    if (!salt || !hashHex) return false;
    const hashTentativa = (await scryptAsync(senha, salt, 64)) as Buffer;
    const hashBanco     = Buffer.from(hashHex, "hex");
    if (hashTentativa.length !== hashBanco.length) return false;
    return timingSafeEqual(hashTentativa, hashBanco);
  } catch {
    return false;
  }
}
