import { createBrowserClient } from "@supabase/ssr";

/* ── Validação de URL ───────────────────────────────────────────────
   Detecta os erros mais comuns ao configurar a URL na Vercel:
   · URL vazia ou undefined
   · Espaços / quebras de linha invisíveis (copy-paste do dashboard)
   · Connection string PostgreSQL (porta 5432 ou 6543) em vez da
     URL REST do Supabase: deve ser https://xxxx.supabase.co
   Retorna null quando a URL é válida.
─────────────────────────────────────────────────────────────────── */
function validateSupabaseUrl(url: string | undefined): string | null {
  if (!url) return "ausente";
  if (url !== url.trim())
    return "contém espaços ou quebra de linha — remova no painel da Vercel";
  if (
    url.includes(":5432") ||
    url.includes(":6543") ||
    url.startsWith("postgres://") ||
    url.startsWith("postgresql://")
  ) {
    return (
      "aponta para a conexão PostgreSQL direta (porta 5432/6543) — " +
      "use a URL REST HTTP: https://xxxx.supabase.co"
    );
  }
  if (!url.startsWith("https://"))
    return "deve começar com https://";
  return null;
}

/* ── Verificação de presença de variáveis ───────────────────────────
   Retorna true somente quando URL e chave têm valores reais.

   Aceita dois nomes para a chave anon/publishable:
     · NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — nome usado neste projeto
     · NEXT_PUBLIC_SUPABASE_ANON_KEY        — nome padrão da integração
       oficial Supabase/Vercel (ex: ao adicionar via "Integrations")
   O fallback garante que um dos dois nomes funcione sem alteração
   nas variáveis da Vercel.
─────────────────────────────────────────────────────────────────── */
export function supabaseConfigurado(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    validateSupabaseUrl(url) === null &&
    !url.includes("placeholder") &&
    key !== "placeholder-key"
  );
}

/* ── Factory do Browser Client ──────────────────────────────────────
   NUNCA criamos o cliente no nível do módulo: durante o build da
   Vercel, módulos são avaliados antes das NEXT_PUBLIC_* serem
   embutidas pelo bundler. A factory garante leitura em runtime.

   Ordem de resolução da chave:
     1. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
     2. NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback — integração padrão)

   Segurança: nunca imprime o valor das chaves — apenas a presença.
─────────────────────────────────────────────────────────────────── */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Diagnóstico local (aparece apenas no terminal dev, não no bundle) */
  if (process.env.NODE_ENV === "development") {
    const urlErr = validateSupabaseUrl(url);
    if (urlErr) {
      console.error(`[Supabase Browser] URL inválida: ${urlErr}`);
    }
    if (!key) {
      console.error(
        "[Supabase Browser] Chave pública ausente!\n" +
        "  Configure UMA das variáveis abaixo no .env.local:\n" +
        "    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx\n" +
        "    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...\n\n" +
        "  Presença atual das vars:\n" +
        `    NEXT_PUBLIC_SUPABASE_URL:             ${!!url}\n` +
        `    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}\n` +
        `    NEXT_PUBLIC_SUPABASE_ANON_KEY:        ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      );
    }
  }

  return createBrowserClient(
    url ?? "https://placeholder.supabase.co",
    key ?? "placeholder-key"
  );
}

/* ── Tipos espelhando o schema do banco ─────────────────────────── */
export interface ProfissionalDB {
  id: string;
  nome: string;
  slug: string;
  especialidade: string | null;
  whatsapp: string;
  role: "OWNER" | "BARBER";
  instagram_url: string | null;
  foto_url: string | null;
}

export interface AgendamentoDB {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string | null;
  servico: string;
  data_hora: string;
  duracao: number;
  preco: number;
  status: "confirmado" | "concluido" | "bloqueado";
  tags: string[];
  profissional_id: string | null;
}
