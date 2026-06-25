import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

/* ── Matcher: protege /admin/qualquercoisa mas NÃO /admin (login) ── */
export const config = {
  matcher: ["/admin/:slug+"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;

  /* ── 1. Token ausente → redireciona para o login ─────────────── */
  if (!token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  /* ── 2. Token inválido ou expirado → limpa cookie + redireciona ─ */
  const payload = await verifyAdminToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return response;
  }

  /* ── 3. RBAC — Privilege Escalation Fix ─────────────────────────
     BARBERs só podem acessar o próprio painel (/admin/<seu-slug>).
     OWNERs transitam livremente por qualquer slug.
  ──────────────────────────────────────────────────────────────── */
  if (payload.role === "BARBER") {
    /* Extrai o slug da URL: /admin/pablo → "pablo" */
    const urlSlug = pathname.split("/")[2];
    if (urlSlug && urlSlug !== payload.slug) {
      return NextResponse.redirect(
        new URL(`/admin/${payload.slug}`, request.url)
      );
    }
  }

  return NextResponse.next();
}
