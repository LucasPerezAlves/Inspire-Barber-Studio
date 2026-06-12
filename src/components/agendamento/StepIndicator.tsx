"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ETAPAS = [
  { label: "Serviços",     short: "Serv." },
  { label: "Profissional", short: "Prof." },
  { label: "Data & Hora",  short: "Hora"  },
  { label: "Seus dados",   short: "Dados" },
] as const;

interface StepIndicatorProps {
  etapaAtual: number;
  totalEtapas: number;
  onIrPara: (etapa: number) => void;
}

export function StepIndicator({ etapaAtual, onIrPara }: StepIndicatorProps) {
  return (
    <nav aria-label="Progresso do agendamento" className="py-4">
      <ol className="flex items-center">
        {ETAPAS.map((etapa, idx) => {
          const numero    = idx + 1;
          const concluida = numero < etapaAtual;
          const ativa     = numero === etapaAtual;
          const futura    = numero > etapaAtual;

          return (
            <li key={etapa.label} className="flex items-center flex-1">
              {/* Bullet + label */}
              <button
                onClick={() => concluida && onIrPara(numero)}
                disabled={futura}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                  "disabled:cursor-not-allowed",
                  concluida && "cursor-pointer"
                )}
                aria-current={ativa ? "step" : undefined}
              >
                {/* Bullet */}
                <span
                  className={cn(
                    "relative w-7 h-7 flex items-center justify-center",
                    "text-[11px] font-bold transition-all duration-300",
                    ativa    && "bg-[#C9A84C] text-[#0B0B0B] shadow-[0_0_16px_0_#C9A84C50]",
                    concluida && "bg-[#C9A84C20] border border-[#C9A84C50] text-[#C9A84C]",
                    futura   && "bg-[#1A1A1A] border border-[#2A2A2A] text-[#6B6760]"
                  )}
                >
                  {concluida ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    numero
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "hidden sm:block text-[10px] font-medium tracking-wider uppercase",
                    "transition-colors duration-200",
                    ativa     && "text-[#C9A84C]",
                    concluida && "text-[#A07840]",
                    futura    && "text-[#6B6760]"
                  )}
                >
                  <span className="hidden md:inline">{etapa.label}</span>
                  <span className="md:hidden">{etapa.short}</span>
                </span>
              </button>

              {/* Connector line (after all except last) */}
              {idx < ETAPAS.length - 1 && (
                <div className="flex-1 mx-2 mt-[-14px] sm:mt-[-20px]">
                  <div
                    className={cn(
                      "h-px w-full transition-all duration-500",
                      concluida
                        ? "bg-gradient-to-r from-[#C9A84C60] to-[#C9A84C30]"
                        : "bg-[#2A2A2A]"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
