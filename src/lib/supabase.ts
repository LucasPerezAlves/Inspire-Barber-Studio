import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

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
