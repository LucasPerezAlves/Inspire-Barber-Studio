"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Scissors, AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { mascaraTelefone } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";

/* ── Profissionais autorizados (mock) ───────────────────────────── */
const PROFISSIONAIS = [
  {
    slug:      "pablo",
    nome:      "Pablo de Oliveira",
    whatsapp:  "11999999999",
    role:      "owner" as const,
  },
  {
    slug:      "altamiro",
    nome:      "Altamiro Peixer",
    whatsapp:  "11888888888",
    role:      "barber" as const,
  },
] as const;

/* ── Helpers ────────────────────────────────────────────────────── */
function saveAdminSession(slug: string, nome: string, role: string) {
  try {
    sessionStorage.setItem(
      "inspire_admin_session",
      JSON.stringify({ slug, nome, role })
    );
  } catch {}
}

/* ══════════════════════════════════════════════════════════════════
   Página de login do painel
══════════════════════════════════════════════════════════════════ */
export default function AdminLoginPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [erro,     setErro]     = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErro("");
    setWhatsapp(mascaraTelefone(e.target.value));
  };

  const handleAcessar = async () => {
    const digits = whatsapp.replace(/\D/g, "");

    const profissional = PROFISSIONAIS.find((p) => p.whatsapp === digits);

    if (!profissional) {
      setErro("Acesso não autorizado para este número.");
      return;
    }

    setErro("");
    setLoading(true);

    saveAdminSession(profissional.slug, profissional.nome, profissional.role);

    /* Simula latência de autenticação */
    await new Promise((r) => setTimeout(r, 700));

    router.push(`/admin/${profissional.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAcessar();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] flex flex-col items-center justify-center px-5">
      {/* Gradiente de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,#C9A84C06_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* ── Card ──────────────────────────────────────────────── */}
        <div className="bg-[#121212] border border-[#1E1E1E] overflow-hidden">

          {/* Barra dourada superior */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          <div className="px-7 py-8">

            {/* Ícone central */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 flex items-center justify-center bg-[#C9A84C10] border border-[#C9A84C30]">
                <Scissors className="w-6 h-6 text-[#C9A84C]" strokeWidth={1.5} />
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-7">
              <h1 className="font-display text-2xl font-semibold text-[#F0EDE8] leading-tight mb-1">
                Portal do Profissional 💈
              </h1>
              <p className="text-[11px] text-[#6B6760] tracking-widest uppercase">
                Inspire Barber Studio
              </p>
            </div>

            {/* Campo WhatsApp */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-[10px] font-semibold tracking-[0.25em] uppercase text-[#A8A49E] mb-2"
                >
                  WhatsApp Cadastrado
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6760]"
                    strokeWidth={1.5}
                  />
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={whatsapp}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="(11) 99999-9999"
                    maxLength={16}
                    className={cn(
                      "w-full bg-[#0D0D0D] pl-10 pr-4 py-4",
                      "text-[16px] sm:text-sm text-[#F0EDE8] placeholder:text-[#2A2A2A]",
                      "border outline-none transition-all duration-200",
                      erro
                        ? "border-red-900 focus:border-red-700"
                        : "border-[#2A2A2A] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C15]"
                    )}
                  />
                </div>

                {/* Mensagem de erro */}
                <AnimatePresence>
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 mt-2.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" strokeWidth={2} />
                      <p className="text-[11px] text-red-600">{erro}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botão de acesso */}
              <button
                onClick={handleAcessar}
                disabled={loading || whatsapp.replace(/\D/g, "").length < 10}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 py-4",
                  "text-sm font-semibold tracking-[0.15em] uppercase",
                  "transition-all duration-300",
                  loading || whatsapp.replace(/\D/g, "").length < 10
                    ? "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
                    : "bg-[#C9A84C] text-[#0B0B0B] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35] active:scale-[0.98]"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Verificando...
                  </>
                ) : (
                  <>
                    Acessar Minha Cadeira
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>

            {/* Dica de teste */}
            <div className="mt-6 pt-5 border-t border-[#1A1A1A]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C30] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] text-[#2E2E2E] leading-relaxed">
                    Acesso restrito à equipe Inspire Barber.
                  </p>
                  <p className="text-[10px] text-[#1E1E1E] mt-1">
                    Teste: (11) 99999-9999 · (11) 88888-8888
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Voltar ao login de cliente */}
        <Link
          href="/auth"
          className="mt-3 text-xs font-medium text-neutral-500 hover:text-amber-500 tracking-wide transition-colors block text-center"
        >
          ← Sou Cliente
        </Link>

        {/* Rodapé */}
        <p className="text-center text-[10px] text-[#2A2A2A] mt-5 tracking-wider uppercase">
          Inspire Barber Studio · Painel Interno
        </p>
      </motion.div>
    </div>
  );
}
