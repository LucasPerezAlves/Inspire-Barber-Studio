/**
 * Cliente Supabase com service_role key.
 *
 * REGRA: importar APENAS em Server Components e Route Handlers (Node.js).
 * Nunca importar em arquivos com "use client" — a chave vazaria para o browser.
 */
import { createClient } from "@supabase/supabase-js";

/* ── Validação de URL ───────────────────────────────────────────────
   Detecta os erros mais comuns ao cadastrar a URL na Vercel:
   · Espaços / quebras de linha invisíveis
   · Connection string PostgreSQL (porta 5432 / 6543) em vez da URL REST
   Retorna null quando a URL é válida.
─────────────────────────────────────────────────────────────────── */
function validateSupabaseUrl(url: string): string | null {
  if (url !== url.trim())
    return "contém espaços ou quebra de linha — remova no painel da Vercel";
  if (
    url.includes(":5432") ||
    url.includes(":6543") ||
    url.startsWith("postgres://") ||
    url.startsWith("postgresql://")
  ) {
    return (
      "aponta para conexão PostgreSQL (porta 5432/6543) — " +
      "use a URL REST: https://xxxx.supabase.co"
    );
  }
  if (!url.startsWith("https://"))
    return "deve começar com https://";
  return null;
}

export function makeServerClient() {
  /* O servidor tem acesso a todas as env vars — tenta NEXT_PUBLIC_ primeiro
     (mais comum), depois SUPABASE_URL sem prefixo como fallback para o caso
     de o usuário ter cadastrado sem o prefixo na Vercel.                   */
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  /* ── Diagnóstico seguro — aparece nos Vercel Function Logs (privados) ───
     Acesse em: Vercel Dashboard → Deployment → Functions → [rota] → Logs
     NUNCA exibe o valor das chaves — apenas a presença (true/false).
     Remova este bloco após confirmar que as variáveis estão corretas.
  ─────────────────────────────────────────────────────────────────────── */
  console.log("[supabase-server] diagnóstico de ambiente:", {
    NEXT_PUBLIC_SUPABASE_URL:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL:              !!process.env.SUPABASE_URL,
    url_resolvida:             !!url,
    SUPABASE_SERVICE_ROLE_KEY: !!key,
    JWT_SECRET:                !!process.env.JWT_SECRET,
  });

  if (url) {
    const urlErr = validateSupabaseUrl(url);
    if (urlErr) {
      console.error("[supabase-server] URL inválida →", urlErr);
    }
  }

  /* ── Guard com mensagem detalhada de qual variável está faltando ────── */
  if (!url || !key || key === "cole-aqui-sua-service-role-key") {
    const faltando: string[] = [];
    if (!url) faltando.push("NEXT_PUBLIC_SUPABASE_URL (ou SUPABASE_URL)");
    if (!key) faltando.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(
      `[supabase-server] Variáveis ausentes na Vercel: ${faltando.join(", ")}. ` +
      "Configure em: Vercel Dashboard → Settings → Environment Variables → " +
      "Selecione os ambientes Production, Preview e Development."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession:     false,
      autoRefreshToken:   false,
      detectSessionInUrl: false,
    },
  });
}
