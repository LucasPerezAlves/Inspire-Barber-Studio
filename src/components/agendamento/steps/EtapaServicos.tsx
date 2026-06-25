"use client";

import { Clock } from "lucide-react";
import { SERVICOS, type Servico, formatarPreco, formatarDuracao } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EtapaServicosProps {
  selecionados:  string[];
  onToggle:      (id: string) => void;
  onAvancar:     () => void;
  totalPreco:    number;
  totalDuracao:  number;
}

const CATEGORIAS: { key: Servico["categoria"]; label: string }[] = [
  { key: "cabelo",   label: "Cabelo"   },
  { key: "barba",    label: "Barba"    },
  { key: "estetica", label: "Estética" },
  { key: "combo",    label: "Combos"   },
];

export function EtapaServicos({
  selecionados,
  onToggle,
  onAvancar,
  totalPreco,
  totalDuracao,
}: EtapaServicosProps) {
  const podeAvancar = selecionados.length > 0;

  return (
    <div className="pb-44 sm:pb-36 pt-2">
      {/* Título */}
      <div className="py-5 border-b border-[#1A1A1A] mb-4">
        <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
          Escolha os serviços
        </h2>
        <p className="text-[#6B6760] text-xs mt-0.5">
          Selecione um ou mais serviços para continuar
        </p>
      </div>

      {/* Lista agrupada */}
      {CATEGORIAS.map(({ key, label }) => {
        const servicos = SERVICOS.filter((s) => s.categoria === key);
        return (
          <div key={key} className="mb-4">
            {/* Categoria header */}
            <div className="flex items-center gap-2 py-2.5 px-1">
              <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#3A3A3A]">
                {label}
              </span>
              <div className="flex-1 h-px bg-[#1A1A1A]" />
            </div>

            {/* Cards de serviço */}
            <ul className="space-y-2">
              {servicos.map((servico) => (
                <ServiceCard
                  key={servico.id}
                  servico={servico}
                  selecionado={selecionados.includes(servico.id)}
                  onToggle={() => onToggle(servico.id)}
                />
              ))}
            </ul>
          </div>
        );
      })}

      {/* ── Painel fixo no fundo ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0B0B0B]/90 backdrop-blur-xl border-t border-[#C9A84C15] shadow-[0_-8px_32px_0_#00000070]" />

        <div className="relative max-w-2xl mx-auto px-5 pt-4 pb-6 sm:py-4">
          {/* Resumo */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#C9A84C] text-[#0B0B0B] text-[10px] font-bold rounded-sm">
                {selecionados.length}
              </span>
              <span className="text-[#A8A49E] text-sm">
                {selecionados.length === 1 ? "serviço" : "serviços"}
              </span>
              {totalDuracao > 0 && (
                <>
                  <span className="text-[#2A2A2A]">·</span>
                  <span className="flex items-center gap-1 text-[#6B6760] text-xs">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {formatarDuracao(totalDuracao)}
                  </span>
                </>
              )}
            </div>
            <span className="font-display text-xl font-semibold text-[#C9A84C]">
              {totalPreco > 0 ? formatarPreco(totalPreco) : "—"}
            </span>
          </div>

          {/* CTA h-14 */}
          <button
            onClick={onAvancar}
            disabled={!podeAvancar}
            className={cn(
              "h-14 w-full font-mono text-sm font-bold tracking-[0.2em] uppercase",
              "transition-all duration-300",
              podeAvancar
                ? "text-[#0B0B0B] bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_32px_0_#C9A84C50] active:scale-[0.98]"
                : "text-[#6B6760] bg-[#1A1A1A] cursor-not-allowed"
            )}
          >
            {podeAvancar ? "Avançar →" : "Selecione um serviço"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Card de serviço — glassmorphism ────────────────────────────── */
function ServiceCard({
  servico,
  selecionado,
  onToggle,
}: {
  servico:    Servico;
  selecionado: boolean;
  onToggle:   () => void;
}) {
  return (
    <motion.li
      layout
      whileTap={{ scale: 0.985 }}
      onClick={onToggle}
      className={cn(
        "relative flex items-center gap-4 px-4 py-4 sm:py-3.5 cursor-pointer",
        "rounded-xl border backdrop-blur-sm transition-all duration-250",
        selecionado
          ? "bg-[#C9A84C08] border-[#C9A84C50] shadow-[0_0_20px_#C9A84C18]"
          : "bg-[#0F0F0F]/80 border-[#1E1E1E] hover:border-[#C9A84C25] hover:bg-[#131313]/80"
      )}
    >
      {/* Checkbox */}
      <span
        className={cn(
          "shrink-0 w-5 h-5 flex items-center justify-center rounded-sm border transition-all duration-200",
          selecionado
            ? "bg-amber-500 border-amber-500"
            : "bg-transparent border-[#3A3A3A]"
        )}
      >
        {selecionado && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-3 h-3 text-[#0B0B0B]"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </span>

      {/* Nome + duração */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-snug transition-colors duration-200",
            selecionado ? "text-[#F0EDE8]" : "text-[#A8A49E]"
          )}
        >
          {servico.nome}
        </p>
        <span className="flex items-center gap-1 mt-0.5 text-[10px] text-[#6B6760]">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {formatarDuracao(servico.duracao)}
        </span>
      </div>

      {/* Preço */}
      <span
        className={cn(
          "shrink-0 font-display text-base font-semibold transition-colors duration-200",
          selecionado ? "text-[#C9A84C]" : "text-[#4A4A4A]"
        )}
      >
        {formatarPreco(servico.preco)}
      </span>
    </motion.li>
  );
}
