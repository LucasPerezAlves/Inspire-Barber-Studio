/**
 * GET  /api/admin/profissionais   — lista todos os profissionais (OWNER)
 * POST /api/admin/profissionais   — cria novo profissional (OWNER)
 *
 * Requer JWT válido com role OWNER no cookie HttpOnly.
 * Usa service_role key — bypassa RLS, escreve diretamente no banco.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { sanitizeText, sanitizeEmail, sanitizeSlug, sanitizePhone } from "@/lib/sanitize";
import { makeServerClient } from "@/lib/supabase-server";

/* Força execução dinâmica — autenticação via cookie e escrita no banco
   não podem ser cacheadas estaticamente em nenhuma circunstância.    */
export const dynamic = "force-dynamic";

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload || payload.role !== "OWNER") return null;
  return payload;
}

/* ── GET — lista todos ──────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  if (!await requireOwner(request)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { data, error } = await makeServerClient()
      .from("profissionais")
      .select("id, nome, slug, especialidade, whatsapp, email, role, foto_url")
      .order("nome", { ascending: true });

    if (error) {
      console.error("[api/profissionais GET]", error.code, error.message);
      return NextResponse.json({ error: "Erro ao carregar profissionais." }, { status: 500 });
    }

    return NextResponse.json({ profissionais: data ?? [] });
  } catch (err) {
    console.error("[api/profissionais GET] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

/* ── POST — cria novo ───────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  if (!await requireOwner(request)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      nome?: string; especialidade?: string; slug?: string;
      whatsapp?: string; email?: string; password?: string; foto_url?: string;
    };

    const nome          = sanitizeText(body.nome);
    const especialidade = sanitizeText(body.especialidade);
    const slug          = sanitizeSlug(body.slug);
    const whatsapp      = sanitizePhone(body.whatsapp);
    const email         = sanitizeEmail(body.email);
    const password      = sanitizeText(body.password);
    const foto_url      = typeof body.foto_url === "string" ? body.foto_url : null;

    if (!nome || !slug || !email || !password) {
      return NextResponse.json(
        { error: "Nome, slug, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const { error } = await makeServerClient()
      .from("profissionais")
      .insert({ nome, especialidade: especialidade || null, slug, whatsapp: whatsapp || null, email, password, role: "BARBER", foto_url });

    if (error) {
      console.error("[api/profissionais POST]", error.code, error.message);
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug ou e-mail já cadastrado." }, { status: 409 });
      }
      return NextResponse.json({ error: "Erro ao criar profissional." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[api/profissionais POST] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
