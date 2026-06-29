/**
 * POST /api/cliente/historico
 *
 * Salva um registro de corte no histórico E incrementa o contador de
 * fidelidade do cliente.
 *
 * Proteção IDOR (OWASP A01):
 *   · O campo `cliente_id` inserido no banco vem EXCLUSIVAMENTE do
 *     payload.sub do JWT, jamais do body da requisição.
 *   · Mesmo que o cliente altere o body via DevTools, o ID usado
 *     será sempre o dele próprio (validado pelo secret do servidor).
 *
 * Prevenção de Parameter Tampering:
 *   · `valor` é validado como número positivo ≤ R$ 10.000.
 *   · `data` é validada como ISO date (YYYY-MM-DD).
 *   · `servicos` é array de strings, truncado e sanitizado.
 *   · `profissional_nome` é truncado a 100 chars.
 *
 * Lógica de fidelidade:
 *   · Limite configurado em FIDELIDADE_MAX (10 cortes).
 *   · Ao atingir o limite: contador reseta para 0 e flag proximo_gratis = true.
 *   · A flag proximo_gratis não é resetada automaticamente —
 *     o profissional a reseta manualmente via painel após aplicar o prêmio.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyClienteToken, COOKIE_CLIENTE } from "@/lib/auth-cliente";
import { makeServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const FIDELIDADE_MAX = 10;

export async function POST(request: NextRequest) {
  /* ── Autenticação ────────────────────────────────────────────── */
  const token = request.cookies.get(COOKIE_CLIENTE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const payload = await verifyClienteToken(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  /* cliente_id vem do JWT — nunca do body */
  const clienteId = payload.sub;

  /* ── Parse e validação do body ───────────────────────────────── */
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const {
    profissional_nome,
    servicos,
    valor,
    data,
    horario,
  } = body as Record<string, unknown>;

  /* Validações defensivas */
  if (!Array.isArray(servicos) || servicos.length === 0) {
    return NextResponse.json({ error: "Serviços inválidos." }, { status: 400 });
  }
  const valorNum = Number(valor);
  if (!Number.isFinite(valorNum) || valorNum < 0 || valorNum > 10_000) {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }
  if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }
  if (typeof horario !== "string" || horario.length > 10) {
    return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
  }

  /* Sanitização dos campos de texto */
  const nomeProfissional = String(profissional_nome ?? "Qualquer")
    .replace(/[<>&"'`]/g, "")
    .slice(0, 100);

  const servicosSanitizados = (servicos as unknown[])
    .map((s) => String(s).replace(/[<>&"'`]/g, "").slice(0, 100))
    .slice(0, 20);

  /* ── DB: busca contagem atual ─────────────────────────────────── */
  let supabase: ReturnType<typeof makeServerClient>;
  try { supabase = makeServerClient(); }
  catch { return NextResponse.json({ error: "Erro interno." }, { status: 500 }); }

  const { data: clienteAtual, error: fetchErr } = await supabase
    .from("clientes")
    .select("cortes_fidelidade, proximo_gratis")
    .eq("id", clienteId)
    .single();

  if (fetchErr || !clienteAtual) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  /* ── DB: insere histórico ────────────────────────────────────── */
  const { error: insertErr } = await supabase
    .from("historico_cortes")
    .insert({
      cliente_id:        clienteId,      // SEMPRE do JWT
      profissional_nome: nomeProfissional,
      servicos:          servicosSanitizados,
      valor:             valorNum,
      data_agendamento:  data,
      horario:           horario,
    });

  if (insertErr) {
    console.error("[historico] insert error:", insertErr.code, insertErr.message);
    return NextResponse.json({ error: "Erro ao salvar histórico." }, { status: 500 });
  }

  /* ── DB: incrementa fidelidade (lógica de reset) ─────────────── */
  const novaContagem   = clienteAtual.cortes_fidelidade + 1;
  const atingiuLimite  = novaContagem >= FIDELIDADE_MAX;
  const contadorFinal  = atingiuLimite ? 0 : novaContagem;
  const proximoGratis  = atingiuLimite ? true : clienteAtual.proximo_gratis;

  const { data: atualizado, error: updateErr } = await supabase
    .from("clientes")
    .update({ cortes_fidelidade: contadorFinal, proximo_gratis: proximoGratis })
    .eq("id", clienteId)
    .select("cortes_fidelidade, proximo_gratis")
    .single();

  if (updateErr) {
    /* Não bloqueia a resposta — histórico já foi salvo */
    console.error("[historico] fidelidade update error:", updateErr.code);
  }

  return NextResponse.json({
    ok:               true,
    cortes_fidelidade: atualizado?.cortes_fidelidade ?? contadorFinal,
    proximo_gratis:   atualizado?.proximo_gratis    ?? proximoGratis,
    ganhou_recompensa: atingiuLimite,
  });
}
