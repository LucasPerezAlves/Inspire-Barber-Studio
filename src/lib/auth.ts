import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const COOKIE_NAME    = "inspire_admin_token";
export const COOKIE_MAX_AGE = 4 * 60 * 60; // 4 h em segundos

export interface AdminTokenPayload extends JWTPayload {
  nome?: string;   // opcional: ausente em tokens gerados antes desta versão
  slug: string;
  role: "OWNER" | "BARBER";
}

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("[auth] JWT_SECRET não definido nas variáveis de ambiente.");
  return new TextEncoder().encode(s);
}

/**
 * Assina um JWT HS256 com expiração de 4 horas.
 * sub = uuid do profissional.
 */
export async function signAdminToken(
  sub: string,
  slug: string,
  role: "OWNER" | "BARBER",
  nome: string
): Promise<string> {
  return new SignJWT({ slug, role, nome })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(getSecret());
}

/**
 * Verifica e decodifica o JWT.
 * Retorna null se o token for inválido, expirado ou se JWT_SECRET não estiver definido.
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

/** Opções padronizadas do cookie de sessão. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "strict" as const,
    path:      "/",
    maxAge,
  };
}
