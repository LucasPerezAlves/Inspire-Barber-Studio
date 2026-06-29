"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession, logoutCliente } from "@/components/auth/auth-screen";

const stagger = {
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Sessão do cliente (localStorage) — independente do sistema admin */
  const [customerSession, setCustomerSession] = useState<{ nome: string; whatsapp: string } | null>(null);

  useEffect(() => {
    setCustomerSession(getSession());
  }, []);

  const handleLogoutCustomer = useCallback(async () => {
    await logoutCliente();
    setCustomerSession(null);
  }, []);

  const primeiroNome = customerSession?.nome.split(" ")[0] ?? "";

  /* Parallax suave — texto sobe levemente durante o scroll */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* ── Profundidade: glow radial âmbar extremamente sutil ────────
          Confere dimensionalidade ao fundo preto sem competir com o texto.
          Fica ancorado à esquerda, onde a tipografia vive.
      ─────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 15% 50%, rgba(201,168,76,0.05) 0%, transparent 65%)",
        }}
      />

      {/* ── Grain cinematográfico — textura discreta sobre preto puro ─ */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Conteúdo — assimétrico à esquerda ─────────────────────── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 sm:px-10 lg:px-[8vw] pt-28 pb-24"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-[600px] lg:max-w-[680px]"
        >
          {/* Overline mono */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
            <div className="w-6 h-px bg-[#C9A84C]" />
            <span className="font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C]">
              Barbearia Premium · Blumenau, SC
            </span>
          </motion.div>

          {/* Índice da seção */}
          <motion.span
            variants={fadeUp}
            className="block font-mono text-[11px] tracking-[0.28em] text-[#C9A84C25] mb-5 select-none"
          >
            01 — INÍCIO
          </motion.span>

          {/* Headline — tipografia híbrida Serif + peso variável */}
          <motion.h1 variants={fadeUp} className="leading-[0.9] mb-9">
            <span className="block font-display text-[clamp(3.6rem,10vw,8rem)] font-light text-[#F0EDE8] tracking-tight">
              Arte.
            </span>
            <span className="block font-display text-[clamp(3.6rem,10vw,8rem)] font-semibold italic text-gradient-gold tracking-tight">
              Precisão.
            </span>
            <span className="block font-display text-[clamp(3.6rem,10vw,8rem)] font-light text-[#F0EDE8] tracking-tight">
              Estilo.
            </span>
          </motion.h1>

          {/* Descrição — voz Mono espaçada */}
          <motion.p
            variants={fadeUp}
            className="font-mono text-[11px] sm:text-xs text-[#A8A49E] leading-[2] tracking-wide max-w-[300px] mb-11"
          >
            Cada detalhe é pensado para você.
            <br />
            Do corte à barba, do produto ao ambiente —<br />
            uma experiência que vai além do óbvio.
          </motion.p>

          {/* CTA — condicional: visitante → agendamento / cliente logado → perfil */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait" initial={false}>
              {customerSession ? (
                /* ── Cliente autenticado ─────────────────────────────── */
                <motion.div
                  key="cliente"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-3"
                >
                  {/* Saudação personalizada */}
                  <p className="font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C70]">
                    Olá, {primeiroNome}
                  </p>

                  {/* CTA principal */}
                  <Link
                    href="/perfil"
                    className={cn(
                      "group relative inline-flex items-center gap-3 overflow-hidden",
                      "px-9 py-[1.05rem] text-sm font-semibold tracking-[0.2em] uppercase",
                      "border border-[#C9A84C]"
                    )}
                  >
                    <span className={cn(
                      "absolute inset-0 bg-[#C9A84C]",
                      "translate-y-full group-hover:translate-y-0",
                      "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    )} />
                    <span className="relative z-10 text-[#C9A84C] group-hover:text-[#0B0B0B] transition-colors duration-300 delay-[0ms] group-hover:delay-[50ms]">
                      Ver Meus Agendamentos
                    </span>
                    <ArrowRight
                      className="relative z-10 w-4 h-4 text-[#C9A84C] group-hover:text-[#0B0B0B] group-hover:translate-x-1 transition-all duration-300"
                      strokeWidth={2}
                    />
                  </Link>

                  {/* Sair discreto */}
                  <button
                    type="button"
                    onClick={handleLogoutCustomer}
                    className={cn(
                      "self-start flex items-center gap-1.5",
                      "font-mono text-[10px] tracking-[0.3em] uppercase",
                      "text-[#3A3A3A] hover:text-red-400 transition-colors duration-200"
                    )}
                  >
                    <LogOut className="w-3 h-3" strokeWidth={1.5} />
                    Sair da conta
                  </button>
                </motion.div>
              ) : (
                /* ── Visitante ───────────────────────────────────────── */
                <motion.div
                  key="visitante"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href="/agendar"
                    className={cn(
                      "group relative inline-flex items-center gap-3 overflow-hidden",
                      "px-9 py-[1.05rem] text-sm font-semibold tracking-[0.2em] uppercase",
                      "border border-[#C9A84C]"
                    )}
                  >
                    <span className={cn(
                      "absolute inset-0 bg-[#C9A84C]",
                      "translate-y-full group-hover:translate-y-0",
                      "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    )} />
                    <span className="relative z-10 text-[#C9A84C] group-hover:text-[#0B0B0B] transition-colors duration-300 delay-[0ms] group-hover:delay-[50ms]">
                      Agendar Horário
                    </span>
                    <ArrowRight
                      className="relative z-10 w-4 h-4 text-[#C9A84C] group-hover:text-[#0B0B0B] group-hover:translate-x-1 transition-all duration-300"
                      strokeWidth={2}
                    />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Stats — canto inferior direito, assimétrico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="absolute bottom-16 right-6 sm:right-10 lg:right-[8vw] flex items-end gap-7 sm:gap-10"
        >
          {[
            { value: "5.0 ★", label: "Google" },
            { value: "65+",   label: "Avaliações" },
            { value: "100%",  label: "Satisfação" },
          ].map(({ value, label }) => (
            <div key={label} className="text-right">
              <span className="block font-display text-2xl sm:text-3xl text-[#C9A84C] font-semibold">
                {value}
              </span>
              <span className="block font-mono text-[9px] tracking-[0.3em] uppercase text-[#6B6760] mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Linha de scroll */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative w-px h-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C90] to-transparent animate-[slideDown_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </motion.div>

      {/* Marcas de canto editoriais */}
      <div className="absolute top-7 left-7 w-9 h-9 border-t border-l border-[#C9A84C18] z-20 pointer-events-none" />
      <div className="absolute top-7 right-7 w-9 h-9 border-t border-r border-[#C9A84C18] z-20 pointer-events-none" />
    </section>
  );
}
