import { NextResponse, type NextRequest } from "next/server";
import { signAdminToken, COOKIE_NAME, COOKIE_MAX_AGE, cookieOptions } from "@/lib/auth";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import { makeServerClient } from "@/lib/supabase-server";

/* Força execução dinâmica em cada request — impede que o Next.js
   tente cachear ou pré-renderizar esta rota de autenticação.       */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, website } = body as {
      email?: string;
      password?: string;
      website?: string;
    };

    /* ── Honeypot: campo invisível preenchido → bot detectado ────── */
    if (website) {
      /* Retorna 200 para não revelar a proteção ao atacante */
      return NextResponse.json({ ok: true, slug: "" }, { status: 200 });
    }

    /* ── Sanitização de inputs ───────────────────────────────────── */
    const cleanEmail    = sanitizeEmail(email);
    const cleanPassword = sanitizeText(password);

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos." },
        { status: 400 }
      );
    }

    /* ── [TEMP-DIAG] Vercel Function Log — remove após confirmar vars ─
       Nunca expõe valores: apenas true/false de presença.
       Veja em: Vercel Dashboard → Deployment → Functions → login        */
    console.log("[api/login] env vars presentes:", {
      NEXT_PUBLIC_SUPABASE_URL:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL:              !!process.env.SUPABASE_URL,
      SERVICE_ROLE_KEY:          !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET:                !!process.env.JWT_SECRET,
    });
    /* ──────────────────────────────────────────────────────────────── */

    /* ── Validação de credenciais contra o Supabase ──────────────── */
    const supabase = makeServerClient();

    const { data, error } = await supabase
      .from("profissionais")
      .select("id, slug, nome, role, password")
      .eq("email", cleanEmail) // parameterizado pelo SDK — sem concatenação manual
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "E-mail não cadastrado." }, { status: 401 });
      }
      console.error("[api/admin/login] Supabase:", error.code, error.message);
      return NextResponse.json(
        { error: "Erro ao verificar credenciais. Tente novamente." },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "E-mail não cadastrado." }, { status: 401 });
    }

    if (data.password !== cleanPassword) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    /* ── Gera JWT e seta cookie HttpOnly ─────────────────────────── */
    const token = await signAdminToken(data.id, data.slug, data.role);

    const response = NextResponse.json({ ok: true, slug: data.slug });
    response.cookies.set(COOKIE_NAME, token, cookieOptions(COOKIE_MAX_AGE));

    return response;
  } catch (err) {
    console.error("[api/admin/login] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
