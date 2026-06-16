"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Scissors, AlertCircle, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

/* ── Helper ─────────────────────────────────────────────────────── */
function saveAdminSession(slug: string, nome: string, role: string) {
  try {
    sessionStorage.setItem(
      "inspire_admin_session",
      JSON.stringify({ slug, nome, role })
    );
  } catch {}
}

/* ══════════════════════════════════════════════════════════════════
   Portal do Profissional — Login com E-mail e Senha
══════════════════════════════════════════════════════════════════ */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email,       setEmail]       = useState("");
  const [senha,       setSenha]       = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro,        setErro]        = useState("");
  const [loading,     setLoading]     = useState(false);

  const podeEnviar = email.trim().length > 0 && senha.length > 0;

  const handleAcessar = async () => {
    if (!podeEnviar) return;
    setErro("");
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profissionais")
        .select("slug, nome, role, password")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error || !data) {
        setErro("E-mail não cadastrado.");
        return;
      }

      if (data.password !== senha) {
        setErro("Senha incorreta.");
        return;
      }

      saveAdminSession(data.slug, data.nome, data.role);
      router.push(`/admin/${data.slug}`);
    } catch (err) {
      console.error("[AdminLogin]", err);
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAcessar();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] flex flex-col items-center justify-center px-5">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,#C9A84C06_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-[#121212] border border-[#1E1E1E] overflow-hidden">

          {/* Barra dourada */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          <div className="px-7 py-8">

            {/* Ícone */}
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

            {/* Campos */}
            <div className="space-y-3">

              {/* E-mail */}
              <div>
                <label htmlFor="email" className="block text-[10px] font-semibold tracking-[0.25em] uppercase text-[#A8A49E] mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6760]" strokeWidth={1.5} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setErro(""); setEmail(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder="seu@email.com"
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
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="block text-[10px] font-semibold tracking-[0.25em] uppercase text-[#A8A49E] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6760]" strokeWidth={1.5} />
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => { setErro(""); setSenha(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    className={cn(
                      "w-full bg-[#0D0D0D] pl-10 pr-10 py-4",
                      "text-[16px] sm:text-sm text-[#F0EDE8] placeholder:text-[#2A2A2A]",
                      "border outline-none transition-all duration-200",
                      erro
                        ? "border-red-900 focus:border-red-700"
                        : "border-[#2A2A2A] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C15]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6760] hover:text-[#A8A49E] transition-colors"
                  >
                    {mostrarSenha
                      ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                      : <Eye    className="w-4 h-4" strokeWidth={1.5} />
                    }
                  </button>
                </div>
              </div>

              {/* Erro */}
              <AnimatePresence>
                {erro && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" strokeWidth={2} />
                    <p className="text-[11px] text-red-600">{erro}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão */}
              <button
                onClick={handleAcessar}
                disabled={loading || !podeEnviar}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 py-4 mt-1",
                  "text-sm font-semibold tracking-[0.15em] uppercase",
                  "transition-all duration-300",
                  loading || !podeEnviar
                    ? "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
                    : "bg-[#C9A84C] text-[#0B0B0B] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35] active:scale-[0.98]"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />Verificando...</>
                ) : (
                  <>Acessar Minha Cadeira<ArrowRight className="w-4 h-4" strokeWidth={2} /></>
                )}
              </button>
            </div>

            {/* Rodapé do card */}
            <div className="mt-6 pt-5 border-t border-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C30] shrink-0" strokeWidth={1.5} />
                <p className="text-[10px] text-[#2E2E2E]">
                  Acesso restrito à equipe Inspire Barber.
                </p>
              </div>
            </div>

          </div>
        </div>

        <Link
          href="/auth"
          className="mt-3 text-xs font-medium text-neutral-500 hover:text-amber-500 tracking-wide transition-colors block text-center"
        >
          ← Sou Cliente
        </Link>

        <p className="text-center text-[10px] text-[#2A2A2A] mt-5 tracking-wider uppercase">
          Inspire Barber Studio · Painel Interno
        </p>
      </motion.div>
    </div>
  );
}
