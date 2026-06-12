"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { PROFISSIONAIS, type Profissional } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EtapaProfissionalProps {
  profissionalId: string;
  onSelecionar: (id: string) => void;
}

export function EtapaProfissional({ profissionalId, onSelecionar }: EtapaProfissionalProps) {
  return (
    <div className="pt-2 pb-10">
      {/* Título */}
      <div className="py-5 border-b border-[#1A1A1A] mb-6">
        <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
          Escolha o profissional
        </h2>
        <p className="text-[#6B6760] text-xs mt-0.5">
          Toque em um card para avançar automaticamente
        </p>
      </div>

      {/* Mobile: 1 coluna (cards horizontais) | Desktop: 3 colunas (cards verticais) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {PROFISSIONAIS.map((prof, i) => (
          <BarberCard
            key={prof.id}
            profissional={prof}
            selecionado={profissionalId === prof.id}
            onSelecionar={onSelecionar}
            delay={i * 0.08}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-[#6B6760] mt-8 tracking-wider uppercase">
        A seleção avança automaticamente
      </p>
    </div>
  );
}

/* ─── Card do barbeiro ────────────────────────────────────────── */
function BarberCard({
  profissional,
  selecionado,
  onSelecionar,
  delay,
}: {
  profissional: Profissional;
  selecionado: boolean;
  onSelecionar: (id: string) => void;
  delay: number;
}) {
  const isQualquer = profissional.id === "qualquer";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      onClick={() => onSelecionar(profissional.id)}
      className={cn(
        /* Mobile: horizontal (foto à esq, texto à dir) */
        /* Desktop: vertical (foto em cima, texto embaixo) */
        "group flex flex-row sm:flex-col items-center gap-4 sm:gap-3",
        "p-4 w-full text-left sm:text-center",
        "border transition-all duration-300",
        "active:scale-[0.97]",
        selecionado
          ? "border-[#C9A84C] bg-[#C9A84C08] shadow-[0_0_20px_0_#C9A84C20]"
          : "border-[#1E1E1E] bg-[#111111] hover:border-[#C9A84C40] hover:bg-[#141414]"
      )}
    >
      {/* Foto / ícone — quadrada fixa no mobile, aspect-square no desktop */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          "w-20 h-20 sm:w-full sm:h-auto sm:aspect-square",
          "transition-all duration-300",
          selecionado && "ring-2 ring-[#C9A84C] ring-offset-2 ring-offset-[#0B0B0B]"
        )}
      >
        {isQualquer || profissional.foto === null ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#2A2A2A] flex items-center justify-center">
            <UserRound
              className={cn(
                "w-1/2 h-1/2 transition-colors duration-300",
                selecionado ? "text-[#C9A84C]" : "text-[#3A3A3A] group-hover:text-[#6B6760]"
              )}
              strokeWidth={1}
            />
          </div>
        ) : (
          <Image
            src={profissional.foto}
            alt={profissional.nome}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 80px, 200px"
          />
        )}

        {/* Overlay selecionado */}
        {selecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#C9A84C10]"
          />
        )}
      </div>

      {/* Nome + especialidade */}
      <div className="flex-1 sm:w-full sm:flex-none">
        <p
          className={cn(
            "text-sm font-semibold leading-tight transition-colors duration-300",
            selecionado ? "text-[#C9A84C]" : "text-[#F0EDE8] group-hover:text-[#E6C97A]"
          )}
        >
          {profissional.nome}
        </p>
        <p className="text-[11px] text-[#6B6760] mt-1 leading-tight">
          {profissional.especialidade}
        </p>
      </div>
    </motion.button>
  );
}
