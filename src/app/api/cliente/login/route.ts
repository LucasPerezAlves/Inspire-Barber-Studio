/**
 * POST /api/cliente/login
 *
 * Autentica um cliente via whatsapp + senha, emite JWT HttpOnly.
 *
 * Segurança:
 *   · Se o usuário não existir, ainda executa verificarSenha() com hash
 *     fictício para garantir tempo de resposta constante (timing-safe).
 *   · Mensagem de erro genérica — não revela se o WhatsApp existe ou não.
 */
import { NextResponse, type NextRequest } from "next/server";
import { makeServerClient } from "@/lib/supabase-server";
import {
  signClienteToken,
  cookieOptionsCliente,
  COOKIE_CLIENTE,
  CLIENTE_MAX_AGE,
} from "@/lib/auth-cliente";
import { verificarSenha } from "@/lib/crypto-senha";

export const dynamic = "force-dynamic";

/*
 * Hash fictício para timing-safe: salt 32 hex chars (16 bytes) + hash 128 hex
 * chars (64 bytes) — garante que Buffer.from(hashHex, "hex").length === 64 e
 * timingSafeEqual seja sempre chamado, impedindo timing-attack por user enum.
 */
const DUMMY_HASH =
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6" +
  "a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6a7b8";

export async function POST(request: NextRequest) {
  /* Envelope global — captura qualquer exceção não tratada */
  try {
    return await handleLogin(request);
  } catch (err) {
    console.error("[ERRO LOGIN]:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

async function handleLogin(request: NextRequest) {
  /* ── Parse do body ────────────────────────────────────────────── */
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const { whatsapp, password } = body as Record<string, string>;
  const digits   = String(whatsapp ?? "").replace(/\D/g, "");
  const senhaStr = String(password  ?? "");

  if (digits.length < 11 || senhaStr.length < 6) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  /* ── Inicializa cliente Supabase ─────────────────────────────── */
  let supabase: ReturnType<typeof makeServerClient>;
  try {
    supabase = makeServerClient();
  } catch (err) {
    console.error("[ERRO LOGIN] makeServerClient falhou:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }

  /* ── Busca o cliente pelo WhatsApp ───────────────────────────── */
  const { data: user, error: queryError } = await supabase
    .from("clientes")
    .select("id, nome, whatsapp, senha_hash, cortes_fidelidade, proximo_gratis")
    .eq("whatsapp", digits)
    .maybeSingle();

  if (queryError) {
    /* Erro 42P01 = tabela "clientes" não existe → execute o SQL no Supabase Dashboard.
       Retorna 500 (não 401) para distinguir falha de infra de falha de credenciais.   */
    console.error("[ERRO LOGIN] query falhou:", queryError.code, queryError.message);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }

  /* ── Timing-safe: sempre executa verificarSenha ──────────────── */
  const hashParaVerificar = user?.senha_hash ?? DUMMY_HASH;
  const senhaCorreta      = await verificarSenha(senhaStr, hashParaVerificar);

  if (!user || !senhaCorreta) {
    return NextResponse.json(
      { error: "WhatsApp ou senha incorretos. Verifique e tente novamente." },
      { status: 401 },
    );
  }

  /* ── Assina JWT e emite cookie HttpOnly (path: "/") ──────────── */
  const token = await signClienteToken(user.id, user.nome, user.whatsapp);

  const response = NextResponse.json(
    {
      ok:                true,
      nome:              user.nome,
      whatsapp:          user.whatsapp,
      cortes_fidelidade: user.cortes_fidelidade,
      proximo_gratis:    user.proximo_gratis,
    },
    { status: 200 },
  );
  response.cookies.set(COOKIE_CLIENTE, token, cookieOptionsCliente(CLIENTE_MAX_AGE));
  return response;
}
