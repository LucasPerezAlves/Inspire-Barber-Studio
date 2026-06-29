import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

/* Matcher: protege /admin/qualquercoisa mas NAO /admin (login) */
export const config = {
  matcher: ["/admin/:slug+"],
};

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(COOKIE_NAME)?.value;

    /* 1. Token ausente: redireciona para o login */
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    /*
     * 2. Token invalido / expirado / JWT_SECRET ausente:
     * verifyAdminToken ja captura qualquer excecao interna e
     * retorna null; aqui limpamos o cookie e redirecionamos.
     */
    const payload = await verifyAdminToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return response;
    }

    /*
     * 3. RBAC -- Privilege Escalation Fix
     * BARBERs so podem acessar o proprio painel (/admin/<seu-slug>).
     * OWNERs transitam livremente por qualquer slug.
     */
    if (payload.role === "BARBER") {
      /* Extrai o slug da URL: /admin/pablo -> "pablo" */
      const urlSlug = pathname.split("/")[2];
      if (urlSlug && urlSlug !== payload.slug) {
        return NextResponse.redirect(
          new URL(`/admin/${payload.slug}`, request.url)
        );
      }
    }

    return NextResponse.next();
  } catch (err: unknown) {
    /*
     * Fallback de seguranca: qualquer erro nao previsto no Edge Runtime
     * (ex.: falha de importacao do jose, JWT_SECRET ausente) redireciona
     * para login em vez de retornar um 500 que exporia o stacktrace.
     * O log abaixo expoe apenas o tipo do erro -- nunca o valor de
     * JWT_SECRET ou qualquer dado de sessao.
     */
    const tipo = err instanceof Error ? err.constructor.name : typeof err;
    console.error(`[middleware] Erro no Edge Runtime (${tipo}) -- redirecionando para login.`);
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}
