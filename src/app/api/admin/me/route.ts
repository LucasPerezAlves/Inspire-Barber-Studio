/**
 * GET /api/admin/me
 *
 * Verificação discreta de sessão admin para reidratação de estado no client.
 *
 * Lê o cookie HttpOnly `inspire_admin_token`, descriptografa o JWT via
 * `jose` e retorna os dados públicos do profissional autenticado.
 *
 * Segurança:
 *   · Nunca expõe o `sub` (uuid) nem campos internos do JWT.
 *   · Cookie HttpOnly: inacessível via JS — este endpoint é o único
 *     canal legítimo para o browser saber se há sessão ativa.
 *   · 401 amigável (sem stacktrace) quando ausente ou inválido.
 *   · force-dynamic impede cache do Next.js server-side.
 *   · Cache-Control: no-store impede cache do browser E do CDN da Vercel,
 *     garantindo que cada chamada reflita o estado real do cookie.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Headers que impedem qualquer camada de cache de armazenar a resposta.
   Aplicados tanto nas respostas 401 quanto nas 200 — o estado de sessão
   muda com login/logout e nunca pode ser servido de um snapshot antigo. */
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma:          "no-cache",
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  /*
   * Retorna sempre 200 — este endpoint é um "session probe", não um recurso
   * protegido. Retornar 401 quando o cookie está ausente gera logs amarelos
   * desnecessários no terminal do Turbopack a cada visita de usuário deslogado.
   * O flag `authenticated` é suficiente para que o cliente tome a decisão correta.
   */
  if (!token) {
    return NextResponse.json({ authenticated: false }, { headers: NO_CACHE_HEADERS });
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { headers: NO_CACHE_HEADERS });
  }

  /* Retorna apenas dados públicos de exibição — nunca sub, iat, exp */
  return NextResponse.json(
    {
      authenticated: true,
      nome: payload.nome ?? payload.slug,
      slug: payload.slug,
      role: payload.role,
    },
    { status: 200, headers: NO_CACHE_HEADERS },
  );
}
