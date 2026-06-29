/**
 * GET /api/cliente/perfil
 *
 * Retorna o perfil completo do cliente (dados pessoais + fidelidade +
 * histórico de cortes), lendo sempre do banco de dados.
 *
 * Segurança:
 *   · cliente_id vem exclusivamente do JWT (payload.sub) — nunca de query param.
 *   · Nunca expõe senha_hash.
 *   · Cache-Control: no-store garante dados sempre frescos.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyClienteToken, COOKIE_CLIENTE } from "@/lib/auth-cliente";
import { makeServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma:          "no-cache",
};

export async function GET(request: NextRequest) {
  /* ── Autenticação ────────────────────────────────────────────── */
  const token = request.cookies.get(COOKIE_CLIENTE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: NO_CACHE });
  }

  const payload = await verifyClienteToken(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401, headers: NO_CACHE });
  }

  const clienteId = payload.sub;

  /* ── Consultas paralelas ao Supabase ─────────────────────────── */
  let supabase: ReturnType<typeof makeServerClient>;
  try { supabase = makeServerClient(); }
  catch { return NextResponse.json({ error: "Erro interno." }, { status: 500, headers: NO_CACHE }); }

  const [clienteResult, historicoResult] = await Promise.all([
    supabase
      .from("clientes")
      .select("nome, whatsapp, cortes_fidelidade, proximo_gratis")
      .eq("id", clienteId)
      .single(),

    supabase
      .from("historico_cortes")
      .select("id, profissional_nome, servicos, valor, data_agendamento, horario, criado_em")
      .eq("cliente_id", clienteId)
      .order("criado_em", { ascending: false })
      .limit(20),
  ]);

  if (clienteResult.error || !clienteResult.data) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404, headers: NO_CACHE });
  }

  const c = clienteResult.data;

  return NextResponse.json(
    {
      nome:              c.nome,
      whatsapp:          c.whatsapp,
      cortes_fidelidade: c.cortes_fidelidade,
      proximo_gratis:    c.proximo_gratis,
      historico:         historicoResult.data ?? [],
    },
    { headers: NO_CACHE },
  );
}
