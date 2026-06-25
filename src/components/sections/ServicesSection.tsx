"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* Cards editoriais — 3 grupos de serviços com numeração fina */
const CARDS = [
  {
    num:   "01",
    title: "Cabelo",
    desc:  "Do clássico ao moderno. Técnica apurada para cada tipo de cabelo e personalidade.",
    items: ["Degradê & Fade", "Corte Social", "Tesoura Completa"],
    from:  "R$ 45",
  },
  {
    num:   "02",
    title: "Barba",
    desc:  "Modelagem precisa com navalha ou máquina. Contorno, definição e acabamento impecável.",
    items: ["Barba na Máquina", "Barba na Navalha", "Design Completo"],
    from:  "R$ 40",
  },
  {
    num:   "03",
    title: "Experiência Premium",
    desc:  "Combinações exclusivas para o resultado máximo em um único atendimento.",
    items: ["Cabelo + Barba", "Cabelo + Barba + Sobrancelha", "Estética Completa"],
    from:  "R$ 70",
  },
] as const;

const GAP = 24; // px entre cards

export function ServicesSection() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const cardsRef       = useRef<HTMLDivElement[]>([]);
  const x              = useMotionValue(0);
  const [active, setActive] = useState(0);

  /* Snap para o card mais próximo após arrastar */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const stride = (cardsRef.current[0]?.offsetWidth ?? 440) + GAP;
    const threshold = stride * 0.22;

    let next = active;
    if (info.offset.x < -threshold) next = Math.min(CARDS.length - 1, active + 1);
    if (info.offset.x >  threshold) next = Math.max(0, active - 1);

    setActive(next);
    animate(x, -next * stride, { type: "spring", stiffness: 360, damping: 36 });
  };

  /* Navegação por dot */
  const goTo = (idx: number) => {
    const stride = (cardsRef.current[0]?.offsetWidth ?? 440) + GAP;
    setActive(idx);
    animate(x, -idx * stride, { type: "spring", stiffness: 360, damping: 36 });
  };

  return (
    <section id="servicos" className="relative bg-[#0B0B0B] py-24 lg:py-32 overflow-hidden">
      {/* Acento de fundo */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#C9A84C] opacity-[0.02] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* Header — assimétrico com número de seção */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14 px-6 lg:px-10">
          <div>
            <span className="block font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C] mb-4">
              02 — Serviços
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-[#F0EDE8] leading-[0.92]">
              O que<br />
              <span className="font-semibold italic text-gradient-gold">oferecemos</span>
            </h2>
          </div>
          <p className="font-mono text-[11px] text-[#6B6760] leading-relaxed tracking-wide max-w-[220px]">
            Arraste para explorar os serviços. Cada categoria, um nível de detalhe.
          </p>
        </div>

        {/* ── Carrossel arrastável ──────────────────────────────── */}
        <div ref={constraintsRef} className="overflow-hidden pl-6 lg:pl-10">
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.08}
            dragMomentum={false}
            style={{ x, gap: `${GAP}px`, touchAction: "pan-y" }}
            onDragEnd={handleDragEnd}
            className="flex cursor-grab active:cursor-grabbing select-none"
          >
            {CARDS.map((card, i) => (
              <div
                key={card.num}
                ref={(el) => { if (el) cardsRef.current[i] = el; }}
                className="flex-none w-[82vw] sm:w-[360px] lg:w-[440px]"
              >
                <ServiceCard card={card} isActive={i === active} />
              </div>
            ))}

            {/* Espaço final para o último card não ficar colado */}
            <div className="flex-none w-6 lg:w-10 shrink-0" />
          </motion.div>
        </div>

        {/* Dots + link */}
        <div className="mt-10 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para card ${i + 1}`}
                className={cn(
                  "transition-all duration-400",
                  i === active
                    ? "w-10 h-px bg-[#C9A84C]"
                    : "w-4 h-px bg-[#2A2A2A] hover:bg-[#3A3A3A]"
                )}
              />
            ))}
          </div>

          <Link
            href="/agendar"
            className="group inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-[#6B6760] hover:text-[#C9A84C] transition-colors duration-200"
          >
            Todos os serviços
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Card editorial de serviço ─────────────────────────────────── */
function ServiceCard({
  card,
  isActive,
}: {
  card: (typeof CARDS)[number];
  isActive: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.38, scale: isActive ? 1 : 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="border border-[#1A1A1A] bg-[#0D0D0D] p-8 sm:p-10 flex flex-col h-full"
    >
      {/* Numeração editorial fina */}
      <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#282828] mb-8 block">
        {card.num}
      </span>

      {/* Título */}
      <h3 className="font-display text-3xl sm:text-4xl font-light text-[#F0EDE8] leading-tight mb-3">
        {card.title}
      </h3>

      {/* Separador dourado */}
      <div className="w-8 h-px bg-[#C9A84C] mb-5" />

      {/* Descrição */}
      <p className="font-mono text-[11px] text-[#6B6760] leading-relaxed tracking-wide mb-8 flex-1">
        {card.desc}
      </p>

      {/* Lista de itens */}
      <ul className="space-y-2.5 mb-8">
        {card.items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-wider text-[#A8A49E]"
          >
            <span className="w-1 h-1 bg-[#C9A84C] shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Rodapé do card: preço + CTA */}
      <div className="flex items-end justify-between pt-6 border-t border-[#1A1A1A]">
        <div>
          <span className="block font-mono text-[9px] tracking-[0.35em] uppercase text-[#2A2A2A] mb-1.5">
            A partir de
          </span>
          <span className="font-display text-2xl sm:text-3xl font-semibold text-[#C9A84C]">
            {card.from}
          </span>
        </div>
        <Link
          href="/agendar"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C9A84C] border-b border-[#C9A84C30] pb-0.5 hover:border-[#C9A84C] transition-colors duration-200"
        >
          Agendar →
        </Link>
      </div>
    </motion.div>
  );
}
