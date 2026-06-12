"use client";

import { Clock } from "lucide-react";
import { SERVICOS, type Servico, formatarPreco, formatarDuracao } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EtapaServicosProps {
  selecionados: string[];
  onToggle: (id: string) => void;
  onAvancar: () => void;
  totalPreco: number;
  totalDuracao: number;
}

const CATEGORIAS: { key: Servico["categoria"]; label: string }[] = [
  { key: "cabelo",   label: "Cabelo" },
  { key: "barba",    label: "Barba" },
  { key: "estetica", label: "Estética" },
  { key: "combo",    label: "Combos" },
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
    /* pb extra no mobile para o painel fixo não cobrir o último item */
    <div className="pb-44 sm:pb-36 pt-2">
      {/* Título da etapa */}
      <div className="py-5 border-b border-[#1A1A1A] mb-2">
        <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
          Escolha os serviços
        </h2>
        <p className="text-[#6B6760] text-xs mt-0.5">
          Selecione um ou mais serviços para continuar
        </p>
      </div>

      {/* Lista agrupada por categoria */}
      {CATEGORIAS.map(({ key, label }) => {
        const servicos = SERVICOS.filter((s) => s.categoria === key);
        return (
          <div key={key} className="mb-1">
            {/* Categoria header */}
            <div className="flex items-center gap-2 py-3 px-1">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#6B6760]">
                {label}
              </span>
              <div className="flex-1 h-px bg-[#1E1E1E]" />
            </div>

            {/* Serviços */}
            <ul className="space-y-px">
              {servicos.map((servico) => (
                <ServiceRow
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

      {/* ── Sticky bottom panel ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Blur backdrop com sombra mais pronunciada no mobile */}
        <div className="absolute inset-0 bg-[#0B0B0B]/85 backdrop-blur-xl border-t border-[#C9A84C20] shadow-[0_-8px_32px_0_#00000060]" />

        <div className="relative max-w-2xl mx-auto px-5 pt-4 pb-6 sm:py-4">
          {/* Resumo numérico */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-5 sm:h-5 bg-[#C9A84C] text-[#0B0B0B] text-[10px] font-bold">
                {selecionados.length}
              </span>
              <span className="text-[#A8A49E] text-sm">
                {selecionados.length === 1 ? "serviço" : "serviços"}
              </span>
              {totalDuracao > 0 && (
                <>
                  <span className="text-[#2A2A2A]">|</span>
                  <span className="flex items-center gap-1 text-[#6B6760] text-xs">
                    <Clock className="w-3 h-3" />
                    {formatarDuracao(totalDuracao)}
                  </span>
                </>
              )}
            </div>
            <span className="font-display text-xl font-semibold text-[#C9A84C]">
              {totalPreco > 0 ? formatarPreco(totalPreco) : "—"}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={onAvancar}
            disabled={!podeAvancar}
            className={cn(
              "w-full py-4 text-sm font-semibold tracking-[0.15em] uppercase",
              "transition-all duration-300",
              podeAvancar
                ? "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C40] active:scale-[0.98]"
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

/* ─── Linha de serviço ────────────────────────────────────────── */
function ServiceRow({
  servico,
  selecionado,
  onToggle,
}: {
  servico: Servico;
  selecionado: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.li
      layout
      onClick={onToggle}
      /* py-5 mobile → área de toque ≥ 58px; sm:py-4 desktop */
      className={cn(
        "relative flex items-center gap-4 px-4 py-5 sm:py-4 cursor-pointer",
        "border-l-2 transition-all duration-200",
        selecionado
          ? "bg-[#C9A84C08] border-l-[#C9A84C]"
          : "bg-[#111111] border-l-transparent hover:bg-[#151515] hover:border-l-[#C9A84C30]"
      )}
    >
      {/* Checkbox — maior no mobile para facilitar o toque */}
      <span
        className={cn(
          "shrink-0 w-6 h-6 flex items-center justify-center",
          "border transition-all duration-200",
          selecionado
            ? "bg-[#C9A84C] border-[#C9A84C]"
            : "bg-transparent border-[#3A3A3A] hover:border-[#C9A84C60]"
        )}
      >
        {selecionado && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3.5 h-3.5 text-[#0B0B0B]"
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
            "text-sm font-medium transition-colors duration-200 leading-snug",
            selecionado ? "text-[#F0EDE8]" : "text-[#A8A49E]"
          )}
        >
          {servico.nome}
        </p>
        <span className="flex items-center gap-1 mt-0.5 text-[11px] text-[#6B6760]">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {formatarDuracao(servico.duracao)}
        </span>
      </div>

      {/* Preço */}
      <span
        className={cn(
          "shrink-0 font-display text-base font-semibold transition-colors duration-200",
          selecionado ? "text-[#C9A84C]" : "text-[#6B6760]"
        )}
      >
        {formatarPreco(servico.preco)}
      </span>
    </motion.li>
  );
}
