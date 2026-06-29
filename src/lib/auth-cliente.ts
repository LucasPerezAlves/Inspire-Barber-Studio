/**
 * auth-cliente.ts
 * JWT para autenticação do usuário comum (cliente).
 *
 * Separado de auth.ts (admin) e usa um secret derivado diferente
 * ("cliente:" + JWT_SECRET) para garantir que tokens de cliente não
 * possam ser reutilizados em contextos de admin e vice-versa.
 *
 * EDGE-SAFE: este arquivo usa apenas "jose", que é 100% compatível com
 * o Edge Runtime do Next.js Middleware. As funções de hashing de senha
 * (scrypt/timingSafeEqual) estão em src/lib/crypto-senha.ts (Node.js only).
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/* ── Constantes do cookie ──────────────────────────────────────────── */
export const COOKIE_CLIENTE  = "inspire_cliente_token";
export const CLIENTE_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

/* ── Payload do JWT do cliente ─────────────────────────────────────── */
export interface ClienteTokenPayload extends JWTPayload {
  nome:     string;
  whatsapp: string;
}

/* ── Secret derivado — mesmo JWT_SECRET, prefixo diferente ────────── */
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("[auth-cliente] JWT_SECRET não definido.");
  return new TextEncoder().encode(`cliente:${s}`);
}

/** Assina um JWT HS256 com expiração de 7 dias. sub = UUID do cliente. */
export async function signClienteToken(
  sub:      string,
  nome:     string,
  whatsapp: string,
): Promise<string> {
  return new SignJWT({ nome, whatsapp })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Verifica e decodifica o JWT. Retorna null se inválido ou expirado. */
export async function verifyClienteToken(
  token: string,
): Promise<ClienteTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as ClienteTokenPayload;
  } catch {
    return null;
  }
}

/** Opções padronizadas do cookie de sessão do cliente. */
export function cookieOptionsCliente(maxAge: number) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path:     "/",
    maxAge,
  };
}

