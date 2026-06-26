"use client";

import { cn } from "@/lib/utils";

const ETAPAS = [
  { num: "01", label: "SERVIÇO"       },
  { num: "02", label: "PROFISSIONAL"  },
  { num: "03", label: "HORÁRIO"       },
  { num: "04", label: "DADOS"         },
] as const;

interface StepIndicatorProps {
  etapaAtual:  number;
  totalEtapas: number;
  onIrPara:    (etapa: number) => void;
}

export function StepIndicator({ etapaAtual, onIrPara }: StepIndicatorProps) {
  const pct = ((etapaAtual - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <nav aria-label="Progresso do agendamento" className="py-3">

      {/* ── Barra de progresso ultra-fina ───────────────────────── */}
      <div className="relative h-px bg-[#1A1A1A] mb-3.5">
        {/* Preenchimento âmbar animado */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#C9A84C] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${pct}%` }}
        />
        {/* Ponto de progresso com glow */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "w-1.5 h-1.5 rounded-full bg-[#C9A84C]",
            "shadow-[0_0_8px_3px_#C9A84C50]",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>

      {/* ── Rótulos editoriais ─────────────────────────────────── */}
      <ol className="flex items-center justify-between">
        {ETAPAS.map(({ num, label }, idx) => {
          const numero    = idx + 1;
          const concluida = numero < etapaAtual;
          const ativa     = numero === etapaAtual;

          return (
            <li key={num}>
              <button
                onClick={() => concluida && onIrPara(numero)}
                disabled={numero > etapaAtual}
                aria-current={ativa ? "step" : undefined}
                /* min-h/w-[44px] = zona de toque mínima WCAG 2.5.5 */
                className="min-h-[44px] min-w-[44px] flex flex-col items-start justify-center gap-0.5 disabled:cursor-not-allowed"
              >
                {/* Número */}
                <span
                  className={cn(
                    "font-mono text-[9px] tracking-[0.3em] transition-colors duration-300",
                    ativa     && "text-[#C9A84C]",
                    concluida && "text-[#A07840]",
                    !ativa && !concluida && "text-[#2A2A2A]"
                  )}
                >
                  {num}
                </span>

                {/* Label — oculto em mobile muito pequeno */}
                <span
                  className={cn(
                    "hidden xs:block font-mono text-[8px] sm:text-[9px] tracking-[0.2em]",
                    "transition-colors duration-300",
                    ativa     && "text-[#C9A84C]",
                    concluida && "text-[#4A4A4A]",
                    !ativa && !concluida && "text-[#1A1A1A]"
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
