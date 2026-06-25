import { createBrowserClient } from "@supabase/ssr";

/* ── Validação e inicialização segura ──────────────────────────────
   Em build time (Vercel), as variáveis NEXT_PUBLIC_* são injetadas
   pelo Vercel e ficam disponíveis. Em dev local, precisam estar
   em .env.local. Placeholders são apenas para não travar o build
   se por algum motivo as vars estiverem ausentes.
───────────────────────────────────────────────────────────────────── */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === "development") {
    console.error(
      "\n🔴 [Supabase] Variáveis de ambiente ausentes!\n" +
      "   Crie ou corrija o arquivo .env.local com:\n\n" +
      "   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
      "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx\n\n" +
      "   Valores encontrados:\n" +
      `   NEXT_PUBLIC_SUPABASE_URL       = ${supabaseUrl ?? "(ausente)"}\n` +
      `   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ${supabaseKey ? "(presente)" : "(ausente)"}\n`
    );
  }
}

export const supabase = createBrowserClient(
  supabaseUrl  ?? "https://placeholder.supabase.co",
  supabaseKey  ?? "placeholder-key"
);

/** Retorna true somente quando o cliente tem credenciais reais. */
export function supabaseConfigurado(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseKey !== "placeholder-key"
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
