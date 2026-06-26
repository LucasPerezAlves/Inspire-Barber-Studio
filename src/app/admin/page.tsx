"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Scissors, AlertCircle, ArrowRight,
  Loader2, ShieldCheck, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════
   Portal do Profissional — Login
   Sessão via cookie HttpOnly (jose JWT HS256)
══════════════════════════════════════════════════════════════════ */
export default function AdminLoginPage() {
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [senha,        setSenha]        = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro,         setErro]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [website,      setWebsite]      = useState(""); // honeypot

  /* Floating-label state */
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const podeEnviar = email.trim().length > 0 && senha.length > 0;

  const handleAcessar = async () => {
    if (!podeEnviar || loading) return;
    if (website) { setLoading(false); return; } // honeypot silencioso

    setErro("");
    setLoading(true);

    try {
      const res  = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password: senha, website }),
      });
      const json = await res.json() as { ok?: boolean; slug?: string; error?: string };

      if (!res.ok) {
        setErro(json.error ?? "Erro ao acessar. Tente novamente.");
        return;
      }

      /* Cookie HttpOnly já setado pelo servidor → redireciona */
      router.push(`/admin/${json.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro(
        msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")
          ? "Sem conexão com o servidor. Verifique sua internet."
          : "Erro de conexão. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAcessar();
  };

  /* Helper: label flutua para cima quando há valor ou foco */
  const labelFloating = (value: string, focused: boolean) =>
    value.length > 0 || focused;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center px-5">
      {/* Gradiente radial dourado extremamente suave */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_35%,#C9A84C05_0%,transparent_65%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-[0_32px_64px_0_#00000080]">

          {/* Fio dourado no topo */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C50] to-transparent" />

          <div className="px-7 py-9">

            {/* Ícone central */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#C9A84C0D] border border-[#C9A84C25]">
                <Scissors className="w-6 h-6 text-[#C9A84C]" strokeWidth={1.5} />
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-semibold text-[#F0EDE8] leading-tight mb-1.5">
                Portal do Profissional
              </h1>
              <p className="font-mono text-[10px] text-[#3A3A3A] tracking-[0.35em] uppercase">
                Inspire Barber Studio
              </p>
            </div>

            {/* Campos */}
            <div className="space-y-4">

              {/* Honeypot — invisível, detecta bots */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
              />

              {/* E-mail com label flutuante */}
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2A2A2A] pointer-events-none transition-colors duration-200 z-10"
                  strokeWidth={1.5}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setErro(""); setEmail(e.target.value); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className={cn(
                    "w-full bg-[#0D0D0D] pl-11 pr-4 pt-6 pb-2.5 rounded-xl",
                    "text-[16px] sm:text-sm text-[#F0EDE8]",
                    "border outline-none transition-all duration-200",
                    erro
                      ? "border-red-900/60 focus:border-red-700"
                      : "border-[#1E1E1E] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C12]"
                  )}
                />
                <motion.label
                  htmlFor="email"
                  animate={labelFloating(email, emailFocused)
                    ? { y: "-55%", scale: 0.72, color: emailFocused ? "#C9A84C" : "#6B6760" }
                    : { y: "0%",   scale: 1,    color: "#3A3A3A" }
                  }
                  transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute left-11 top-1/2 -translate-y-1/2 origin-left text-sm pointer-events-none font-medium"
                  style={{ transformOrigin: "left center" }}
                >
                  E-mail
                </motion.label>
              </div>

              {/* Senha com label flutuante */}
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2A2A2A] pointer-events-none transition-colors duration-200 z-10"
                  strokeWidth={1.5}
                />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => { setErro(""); setSenha(e.target.value); }}
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className={cn(
                    "w-full bg-[#0D0D0D] pl-11 pr-12 pt-6 pb-2.5 rounded-xl",
                    "text-[16px] sm:text-sm text-[#F0EDE8]",
                    "border outline-none transition-all duration-200",
                    erro
                      ? "border-red-900/60 focus:border-red-700"
                      : "border-[#1E1E1E] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C12]"
                  )}
                />
                <motion.label
                  htmlFor="senha"
                  animate={labelFloating(senha, senhaFocused)
                    ? { y: "-55%", scale: 0.72, color: senhaFocused ? "#C9A84C" : "#6B6760" }
                    : { y: "0%",   scale: 1,    color: "#3A3A3A" }
                  }
                  transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute left-11 top-1/2 -translate-y-1/2 origin-left text-sm pointer-events-none font-medium"
                  style={{ transformOrigin: "left center" }}
                >
                  Senha
                </motion.label>
                {/* Botão olho — combina com dark design */}
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 z-10",
                    "w-10 h-10 flex items-center justify-center rounded-lg",
                    "text-[#2A2A2A] hover:text-[#6B6760] hover:bg-[#1A1A1A]",
                    "transition-all duration-200"
                  )}
                >
                  {mostrarSenha
                    ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    : <Eye    className="w-4 h-4" strokeWidth={1.5} />
                  }
                </button>
              </div>

              {/* Mensagem de erro */}
              <AnimatePresence>
                {erro && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-red-950/20 border border-red-900/30 rounded-lg"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2} />
                    <p className="text-[11px] text-red-400 leading-snug">{erro}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <button
                onClick={handleAcessar}
                disabled={loading || !podeEnviar}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 h-14 mt-1 rounded-xl",
                  "font-mono text-sm font-bold tracking-[0.2em] uppercase",
                  "transition-all duration-300",
                  loading || !podeEnviar
                    ? "bg-[#141414] text-[#2A2A2A] cursor-not-allowed border border-[#1A1A1A]"
                    : "bg-amber-500 text-[#0B0B0B] hover:bg-amber-400 hover:shadow-[0_0_32px_0_#C9A84C35] active:scale-[0.98]"
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
            <div className="mt-7 pt-5 border-t border-[#0F0F0F]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E1E1E] shrink-0" strokeWidth={1.5} />
                <p className="font-mono text-[9px] text-[#1E1E1E] tracking-wide leading-relaxed">
                  Sessão protegida por cookie HttpOnly · JWT expira em 4h
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Links externos ao card */}
        <div className="mt-4 flex items-center justify-center gap-5">
          <Link
            href="/auth"
            className="font-mono text-[10px] text-[#2A2A2A] hover:text-[#6B6760] tracking-[0.2em] uppercase transition-colors"
          >
            ← Sou Cliente
          </Link>
          <span className="text-[#1A1A1A]">·</span>
          <Link
            href="/"
            className="font-mono text-[10px] text-[#2A2A2A] hover:text-[#6B6760] tracking-[0.2em] uppercase transition-colors"
          >
            Site Principal →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
