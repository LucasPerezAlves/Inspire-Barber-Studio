"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

/* Dados estáticos dos profissionais — links reais de Instagram */
const TEAM = [
  {
    name:             "Pablo de Oliveira",
    role:             "Sócio-Fundador & Barbeiro",
    specialty:        "Degradê · Fade · Estilo Moderno",
    foto:             "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2FgJImKl5pipbmAT8l7eF0RRAB1Ic2.jpeg?alt=media&token=501a651f-9fa4-4795-9f98-8a972bb4a32e",
    instagram:        "https://www.instagram.com/pablodabarbearia/",
    instagramHandle:  "@pablodabarbearia",
  },
  {
    name:             "Altamiro Peixer",
    role:             "Barbeiro Especialista",
    specialty:        "Barba · Navalha · Transformações",
    foto:             "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2F5TZOPLMrnfZ4mEaAAHeu4XmsytK2.jpeg?alt=media&token=696818be-fc46-4680-8819-d8d206fe85ed",
    instagram:        "https://www.instagram.com/altamiropeixer/",
    instagramHandle:  "@altamiropeixer",
  },
] as const;

export function TeamSection() {
  return (
    <section id="equipe" className="relative bg-[#090909] py-24 lg:py-32 overflow-hidden">
      {/* Acento de luz esquerda */}
      <div className="absolute left-0 top-1/4 w-[400px] h-[600px] bg-[#C9A84C] opacity-[0.03] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header — alinhado à esquerda */}
        <div className="mb-14">
          <span className="block font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C] mb-4">
            03 — Equipe
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-16">
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-[#F0EDE8] leading-[0.92]">
              Nossos{" "}
              <span className="font-semibold italic text-gradient-gold">
                Artistas
              </span>
            </h2>
            <p className="font-mono text-[11px] text-[#6B6760] leading-relaxed tracking-wide max-w-[200px] pb-1">
              Passe o mouse ou toque para conhecer cada profissional.
            </p>
          </div>
        </div>

        {/* Grid assimétrico: primeiro card mais largo no desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-[1.15fr_0.85fr] max-w-5xl">
          {TEAM.map((member, i) => (
            <BarberCard key={member.name} member={member} tall={i === 0} />
          ))}
        </div>

        {/* Rodapé discreto */}
        <p className="mt-10 font-mono text-[10px] tracking-[0.3em] uppercase text-[#2A2A2A] text-center">
          Profissionais certificados · Inspire Barber Studio
        </p>
      </div>
    </section>
  );
}

/* ── Card do barbeiro com overlay de hover ─────────────────────── */
function BarberCard({
  member,
  tall,
}: {
  member: (typeof TEAM)[number];
  tall: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        tall ? "aspect-[3/4] lg:aspect-auto lg:h-[540px]" : "aspect-[3/4] lg:h-[540px]"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      /* Mobile: toque alterna o overlay */
      onTouchStart={() => setHovered((v) => !v)}
    >
      {/* Foto — zoom no hover */}
      <Image
        src={member.foto}
        alt={member.name}
        fill
        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 560px"
        className={cn(
          "object-cover object-top",
          "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hovered ? "scale-110" : "scale-100"
        )}
      />

      {/* Gradiente base permanente para o nome ser legível */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/90 via-[#090909]/10 to-transparent" />

      {/* Nome + role — sempre visível */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#F0EDE8] leading-tight">
          {member.name}
        </h3>
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#C9A84C] mt-1.5">
          {member.role}
        </p>
      </div>

      {/* Overlay de hover — sobe de baixo com AnimatePresence */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 bg-[#090909]/88 z-20 flex flex-col justify-end p-6 sm:p-8"
          >
            <motion.div
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.32, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Label de especialidade */}
              <span className="block font-mono text-[9px] tracking-[0.4em] uppercase text-[#C9A84C] mb-2">
                Especialidade
              </span>
              <p className="font-display text-xl sm:text-2xl font-light text-[#F0EDE8] mb-6 leading-snug">
                {member.specialty}
              </p>

              {/* Botão Instagram */}
              <Link
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram de ${member.name}`}
                className={cn(
                  "inline-flex items-center gap-2.5",
                  "border border-[#F0EDE825] px-5 py-3",
                  "font-mono text-[10px] tracking-[0.22em] uppercase text-[#F0EDE8]",
                  "hover:border-[#C9A84C] hover:text-[#C9A84C]",
                  "transition-all duration-200"
                )}
                /* Previne toggle do overlay ao clicar no link */
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
                {member.instagramHandle}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
