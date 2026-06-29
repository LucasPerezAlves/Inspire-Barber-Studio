import { createBrowserClient } from "@supabase/ssr";

/*
 * IMPORTANTE: NAO instanciamos o cliente no nivel do modulo.
 * Em build time (Vercel), modulos sao avaliados antes das env vars
 * serem injetadas no runtime da funcao. Usar uma factory garante que
 * process.env e lido no momento da chamada, nao do import.
 */

/**
 * Retorna true somente quando as variaveis de ambiente do Supabase
 * estao disponiveis e tem valores reais (nao placeholders).
 * Use como guard antes de chamar `getSupabaseClient()`.
 */
export function supabaseConfigurado(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    key !== "placeholder-key"
  );
}

/**
 * Factory que cria (e retorna) um BrowserClient do Supabase.
 * Le as variaveis de ambiente em tempo de chamada -- seguro para
 * Vercel Serverless Functions e Edge Runtime.
 *
 * Lanca um erro em desenvolvimento se as vars estiverem ausentes,
 * para facilitar diagnostico imediato no terminal local.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "\n[Supabase] Variaveis de ambiente ausentes!\n" +
        "   Crie ou corrija o arquivo .env.local com:\n\n" +
        "   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
        "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx\n\n" +
        "   Valores encontrados:\n" +
        `   NEXT_PUBLIC_SUPABASE_URL             = ${url ?? "(ausente)"}\n` +
        `   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ${key ? "(presente)" : "(ausente)"}\n`
      );
    }
  }

  return createBrowserClient(
    url  ?? "https://placeholder.supabase.co",
    key  ?? "placeholder-key"
  );
}

/* Tipos espelhando o schema do banco */
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
