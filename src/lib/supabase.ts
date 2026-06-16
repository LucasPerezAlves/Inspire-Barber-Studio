import { createBrowserClient } from "@supabase/ssr";

/* ── Fallback para build time ───────────────────────────────────────
   NEXT_PUBLIC_* vars são injetadas pelo Vercel em runtime.
   Durante o build estático (sem as vars), usamos placeholders para
   que createBrowserClient não lance uma exceção no carregamento do
   módulo. Nenhuma query real acontece em build — só em runtime.
───────────────────────────────────────────────────────────────────── */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

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
