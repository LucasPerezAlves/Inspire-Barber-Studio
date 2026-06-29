/**
 * GET /api/cliente/me
 *
 * Verificação leve de sessão — lê e valida o cookie JWT do cliente sem
 * fazer query no banco. Usado pela Navbar e HeroSection para reidratação
 * de estado sem custo de DB.
 *
 * Segurança: nunca expõe senha_hash nem UUID interno.
 * Cache-Control: no-store previne que CDN ou browser cache a sessão.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyClienteToken, COOKIE_CLIENTE } from "@/lib/auth-cliente";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma:          "no-cache",
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_CLIENTE)?.value;

  /*
   * Retorna sempre 200 — este endpoint é um "session probe", não um recurso
   * protegido. Retornar 401 quando o cookie está ausente gera logs amarelos
   * desnecessários no terminal do Turbopack a cada visita de usuário deslogado.
   */
  if (!token) {
    return NextResponse.json({ authenticated: false }, { headers: NO_CACHE });
  }

  const payload = await verifyClienteToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { headers: NO_CACHE });
  }

  return NextResponse.json(
    {
      authenticated: true,
      nome:     payload.nome,
      whatsapp: payload.whatsapp,
    },
    { headers: NO_CACHE },
  );
}
