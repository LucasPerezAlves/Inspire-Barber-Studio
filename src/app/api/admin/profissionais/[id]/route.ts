/**
 * PATCH  /api/admin/profissionais/[id]  — atualiza dados ou alterna role (OWNER)
 * DELETE /api/admin/profissionais/[id]  — exclui profissional (OWNER)
 *
 * Requer JWT válido com role OWNER no cookie HttpOnly.
 * Usa service_role key — bypassa RLS.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { sanitizeText, sanitizeEmail, sanitizeSlug, sanitizePhone } from "@/lib/sanitize";
import { makeServerClient } from "@/lib/supabase-server";

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload || payload.role !== "OWNER") return null;
  return payload;
}

/* ── PATCH — atualiza dados ou alterna role ─────────────────────── */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireOwner(request)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json() as {
      action: "update" | "toggleRole";
      currentRole?: "OWNER" | "BARBER";
      nome?: string; especialidade?: string; slug?: string;
      whatsapp?: string; email?: string; password?: string; foto_url?: string | null;
    };

    const supabase = makeServerClient();

    /* ── Alterna role ─── */
    if (body.action === "toggleRole") {
      const newRole = body.currentRole === "OWNER" ? "BARBER" : "OWNER";
      const { data, error } = await supabase
        .from("profissionais")
        .update({ role: newRole })
        .eq("id", id)
        .select("id, role");

      if (error) {
        console.error("[api/profissionais PATCH toggleRole]", error.message);
        return NextResponse.json({ error: "Erro ao alterar role." }, { status: 500 });
      }
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, role: newRole });
    }

    /* ── Atualiza dados ─── */
    const payload: Record<string, unknown> = {};
    if (body.nome)          payload.nome          = sanitizeText(body.nome);
    if (body.especialidade !== undefined) payload.especialidade = sanitizeText(body.especialidade) || null;
    if (body.slug)          payload.slug          = sanitizeSlug(body.slug);
    if (body.whatsapp !== undefined) payload.whatsapp = sanitizePhone(body.whatsapp) || null;
    if (body.email)         payload.email         = sanitizeEmail(body.email);
    if (body.password)      payload.password      = sanitizeText(body.password);
    if (body.foto_url !== undefined) payload.foto_url = body.foto_url;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profissionais")
      .update(payload)
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("[api/profissionais PATCH update]", error.code, error.message);
      return NextResponse.json({ error: "Erro ao atualizar profissional." }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/profissionais PATCH] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

/* ── DELETE — exclui profissional ───────────────────────────────── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireOwner(request)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const supabase = makeServerClient();

    /* Desvincula agendamentos antes de deletar */
    await supabase
      .from("agendamentos")
      .update({ profissional_id: null })
      .eq("profissional_id", id);

    const { error } = await supabase
      .from("profissionais")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[api/profissionais DELETE]", error.code, error.message);
      return NextResponse.json({ error: "Erro ao excluir profissional." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/profissionais DELETE] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
