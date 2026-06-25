/**
 * Cliente Supabase com service_role key.
 *
 * REGRA: importar APENAS em Server Components e Route Handlers (Node.js).
 * Nunca importar em arquivos com "use client" — a chave vazaria para o browser.
 */
import { createClient } from "@supabase/supabase-js";

export function makeServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || key === "cole-aqui-sua-service-role-key") {
    throw new Error(
      "[supabase-server] SUPABASE_SERVICE_ROLE_KEY não configurada. " +
      "Copie de: Supabase → Settings → API → service_role"
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession:    false,
      autoRefreshToken:  false,
      detectSessionInUrl: false,
    },
  });
}
