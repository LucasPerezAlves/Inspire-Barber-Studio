import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken,   COOKIE_NAME    } from "@/lib/auth";
import { verifyClienteToken, COOKIE_CLIENTE  } from "@/lib/auth-cliente";

/*
 * NOTA DE ARQUITETURA — por que este middleware não pode ir para next.config.ts:
 *
 * next.config.ts só suporta rewrites/redirects ESTÁTICOS (sem acesso a cookies
 * nem a lógica assíncrona). A verificação de JWT (jose.jwtVerify) é assíncrona
 * e depende do conteúdo do cookie HttpOnly — portanto deve permanecer aqui.
 *
 * Rotas protegidas:
 *   /admin/:slug+  — painel dos profissionais (JWT admin, RBAC por slug)
 *   /perfil        — área do cliente         (JWT cliente)
 *
 * As rotas-raiz /admin e /auth são intencionalmente excluídas do matcher
 * para que as páginas de login fiquem acessíveis sem autenticação.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Área do cliente (/perfil) ──────────────────────────────────── */
  if (pathname === "/perfil") {
    try {
      const token = request.cookies.get(COOKIE_CLIENTE)?.value;
      if (!token) return NextResponse.redirect(new URL("/auth", request.url));

      const payload = await verifyClienteToken(token);
      if (!payload) {
        const res = NextResponse.redirect(new URL("/auth", request.url));
        res.cookies.set(COOKIE_CLIENTE, "", { maxAge: 0, path: "/" });
        return res;
      }
      return NextResponse.next();
    } catch (err: unknown) {
      const tipo = err instanceof Error ? err.constructor.name : typeof err;
      console.error(`[middleware/cliente] Erro (${tipo}) — redirecionando para /auth.`);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  /* ── Painel dos profissionais (/admin/:slug+) ───────────────────── */
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return response;
    }

    /* RBAC: BARBERs só acessam o próprio slug */
    if (payload.role === "BARBER") {
      const urlSlug = pathname.split("/")[2];
      if (urlSlug && urlSlug !== payload.slug) {
        return NextResponse.redirect(
          new URL(`/admin/${payload.slug}`, request.url),
        );
      }
    }

    return NextResponse.next();
  } catch (err: unknown) {
    const tipo = err instanceof Error ? err.constructor.name : typeof err;
    console.error(`[middleware/admin] Erro (${tipo}) — redirecionando para /admin.`);
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

/* config deve ser declarado APÓS a função — convenção exigida pelo Turbopack */
export const config = {
  matcher: ["/admin/:slug+", "/perfil"],
};
