/**
 * GET /api/admin/painel?slug=<barbeiro>
 *
 * Endpoint seguro para os dados do dashboard do profissional.
 *
 * IDOR FIX: o servidor NUNCA confia no slug vindo da URL para
 * determinar QUEM é o usuário autenticado.
 *   - BARBER → slug ignorado; usa sempre o slug do JWT (cookie HttpOnly)
 *   - OWNER  → aceita qualquer slug válido (tem acesso total)
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { sanitizeSlug } from "@/lib/sanitize";
import { makeServerClient } from "@/lib/supabase-server";

/* Força execução dinâmica — esta rota lê cookies de sessão e consulta
   o banco a cada request; nunca deve ser cacheada estaticamente.     */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  /* ── 1. Autenticação — verifica JWT do cookie ────────────────── */
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
  }

  /* ── 2. IDOR — determina o slug alvo de forma segura ─────────
     BARBER: slug do JWT prevalece sobre qualquer parâmetro da URL.
     OWNER : pode visualizar qualquer painel; usa o parâmetro da URL.
  ─────────────────────────────────────────────────────────────── */
  const urlSlug = sanitizeSlug(new URL(request.url).searchParams.get("slug") ?? "");

  const targetSlug =
    payload.role === "BARBER"
      ? payload.slug               // sempre o próprio, ignora URL
      : (urlSlug || payload.slug); // owner usa o param ou o próprio

  /* ── 3. Busca profissional por slug (parameterizado pelo SDK) ── */
  try {
    const supabase = makeServerClient();

    const { data: prof, error: errProf } = await supabase
      .from("profissionais")
      .select("id, nome, slug, especialidade")
      .eq("slug", targetSlug)
      .single();

    if (errProf) {
      if (errProf.code === "PGRST116") {
        return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
      }
      console.error("[api/admin/painel] Profissional:", errProf.code, errProf.message);
      return NextResponse.json({ error: "Erro ao carregar dados." }, { status: 500 });
    }
    if (!prof) {
      return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    }

    /* ── 4. Busca agendamentos de hoje pelo id do profissional ── */
    const hoje      = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
    const fimDia    = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString();

    const { data: ags, error: errAgs } = await supabase
      .from("agendamentos")
      .select("id, cliente_nome, cliente_whatsapp, servico, data_hora, duracao, preco, status, tags")
      .eq("profissional_id", prof.id) // nunca usa profissional_id da URL; vem de prof.id validado acima
      .gte("data_hora", inicioDia)
      .lte("data_hora", fimDia)
      .order("data_hora", { ascending: true });

    if (errAgs) {
      console.error("[api/admin/painel] Agendamentos:", errAgs.code, errAgs.message);
      return NextResponse.json({ error: "Erro ao carregar agendamentos." }, { status: 500 });
    }

    return NextResponse.json({
      profissional: {
        id:           prof.id,
        nome:         prof.nome,
        slug:         prof.slug,
        especialidade: prof.especialidade ?? "Inspire Barber Studio",
      },
      agendamentos: ags ?? [],
    });
  } catch (err) {
    console.error("[api/admin/painel] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
