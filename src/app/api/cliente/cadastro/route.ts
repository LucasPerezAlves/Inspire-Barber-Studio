/**
 * POST /api/cliente/cadastro
 *
 * Registra um novo cliente no Supabase, hasheia a senha com scrypt e
 * emite um JWT HttpOnly para a sessão.
 *
 * Segurança:
 *   · Nunca retorna senha_hash ao cliente.
 *   · Unique constraint no whatsapp previne duplicatas via race condition.
 *   · Apenas dígitos do whatsapp são armazenados (normalização server-side).
 */
import { NextResponse, type NextRequest } from "next/server";
import { makeServerClient } from "@/lib/supabase-server";
import {
  signClienteToken,
  cookieOptionsCliente,
  COOKIE_CLIENTE,
  CLIENTE_MAX_AGE,
} from "@/lib/auth-cliente";
import { hashSenha } from "@/lib/crypto-senha";

export const dynamic = "force-dynamic";

/** Sanitiza strings de entrada — remove caracteres que viabilizam XSS/SQL injection. */
function sanitize(str: string): string {
  return str.replace(/[<>&"'`]/g, "").trim();
}

export async function POST(request: NextRequest) {
  /* ── Envelope global: captura qualquer exceção não tratada e a loga ─
     Sem este bloco, erros lançados por signClienteToken (ex: JWT_SECRET
     ausente no runtime) ou por qualquer outra chamada async sobem para
     o Next.js e viram um 500 genérico sem nenhum log no terminal.      */
  try {
    return await handleCadastro(request);
  } catch (err) {
    console.error("[ERRO CADASTRO]:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}

async function handleCadastro(request: NextRequest) {
  /* ── Parse do body ────────────────────────────────────────────── */
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const { nome, whatsapp, password, nascimento } = body as Record<string, string>;

  /* ── Validação e sanitização de entrada ──────────────────────── */
  const nomeStr  = sanitize(String(nome      ?? ""));
  const digits   = String(whatsapp  ?? "").replace(/\D/g, "");
  const senhaStr = String(password  ?? "");
  const nascStr  = String(nascimento ?? "");

  if (nomeStr.split(/\s+/).filter(Boolean).length < 2 || nomeStr.length < 5) {
    return NextResponse.json({ error: "Informe nome e sobrenome completos." }, { status: 400 });
  }
  if (digits.length < 11) {
    return NextResponse.json({ error: "WhatsApp inválido — informe DDD + 9 dígitos." }, { status: 400 });
  }
  if (senhaStr.length < 6) {
    return NextResponse.json({ error: "Senha muito curta (mínimo 6 caracteres)." }, { status: 400 });
  }

  const nascFormatado = /^\d{4}-\d{2}-\d{2}$/.test(nascStr) ? nascStr : null;

  /* ── Inicializa cliente Supabase (service_role) ───────────────── */
  let supabase: ReturnType<typeof makeServerClient>;
  try {
    supabase = makeServerClient();
  } catch (err) {
    console.error("[ERRO CADASTRO] makeServerClient falhou:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }

  /* ── Unicidade do WhatsApp ────────────────────────────────────── */
  const { data: existente, error: checkError } = await supabase
    .from("clientes")
    .select("id")
    .eq("whatsapp", digits)
    .maybeSingle();

  if (checkError) {
    /* Erro 42P01 = tabela "clientes" não existe → execute o SQL no Supabase Dashboard */
    console.error("[ERRO CADASTRO] checagem de duplicata:", checkError.code, checkError.message);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }

  if (existente) {
    return NextResponse.json(
      { error: "Este WhatsApp já está cadastrado. Faça login ou recupere a senha." },
      { status: 409 },
    );
  }

  /* ── Hash scrypt (64 bytes, salt 16 bytes) ────────────────────── */
  const senhaHash = await hashSenha(senhaStr);

  /* ── Inserção no banco ────────────────────────────────────────── */
  const { data: novo, error: insertError } = await supabase
    .from("clientes")
    .insert({
      nome:       nomeStr,
      whatsapp:   digits,
      senha_hash: senhaHash,
      nascimento: nascFormatado,
    })
    .select("id, nome, whatsapp, cortes_fidelidade, proximo_gratis")
    .single();

  if (insertError || !novo) {
    console.error(
      "[ERRO CADASTRO] insert falhou:",
      insertError?.code,
      insertError?.message,
      insertError?.details,
    );
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }

  /* ── Assina JWT e emite cookie HttpOnly ───────────────────────── */
  const token = await signClienteToken(novo.id, novo.nome, novo.whatsapp);

  const response = NextResponse.json(
    {
      ok:                true,
      nome:              novo.nome,
      whatsapp:          novo.whatsapp,
      cortes_fidelidade: novo.cortes_fidelidade,
      proximo_gratis:    novo.proximo_gratis,
    },
    { status: 200 },
  );
  response.cookies.set(COOKIE_CLIENTE, token, cookieOptionsCliente(CLIENTE_MAX_AGE));
  return response;
}
