"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { getHorariosDisponiveis, BARBEARIA } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ─── Labels locais para dia/mês ─────────────────────────────────── */
const DIA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const MES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"] as const;

interface EtapaDataHorarioProps {
  data:             Date | undefined;
  horario:          string | null;
  onDataChange:     (data: Date | undefined) => void;
  onHorarioChange:  (horario: string) => void;
  onAvancar:        () => void;
}

export function EtapaDataHorario({
  data,
  horario,
  onDataChange,
  onHorarioChange,
  onAvancar,
}: EtapaDataHorarioProps) {
  /* ── Gera os próximos 28 dias úteis da barbearia ─────────────── */
  const diasUteis = useMemo(() => {
    const result: Date[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 0; i < 35; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      if (BARBEARIA.diasFuncionamento.includes(d.getDay())) result.push(d);
      if (result.length >= 28) break;
    }
    return result;
  }, []);

  const horarios    = data ? getHorariosDisponiveis(data) : [];
  const podeAvancar = !!data && !!horario;

  /* Quando o usuário muda o dia, o pai já limpa o horário em selecionarData */
  const handleSelecionarDia = (dia: Date) => {
    onDataChange(dia);
  };

  return (
    <div className="pt-2 pb-10">
      {/* Título */}
      <div className="py-5 border-b border-[#1A1A1A] mb-6">
        <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
          Data e horário
        </h2>
        <p className="text-[#6B6760] text-xs mt-0.5">
          Selecione o dia e o horário disponível
        </p>
      </div>

      {/* ── Carrossel de dias ─────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#3A3A3A] mb-3 px-1">
          Dias disponíveis
        </p>
        <div className="overflow-x-auto scrollbar-none -mx-5 px-5 snap-x snap-mandatory scroll-smooth">
          <div className="flex gap-2 pb-2 min-w-max">
            {diasUteis.map((dia) => (
              <div key={dia.toISOString()} className="snap-center">
                <DiaBtn
                  dia={dia}
                  selecionado={data?.toDateString() === dia.toDateString()}
                  onSelecionar={handleSelecionarDia}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grade de horários ─────────────────────────────────────── */}
      <div
        className={cn(
          "bg-[#0F0F0F]/80 backdrop-blur-sm rounded-xl border border-[#1E1E1E] p-4",
          "transition-opacity duration-300",
          !data && "opacity-40 pointer-events-none"
        )}
      >
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#3A3A3A] mb-4 flex items-center gap-2">
          <Clock className="w-3 h-3 text-[#C9A84C]" strokeWidth={1.5} />
          {data
            ? data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
            : "Selecione uma data acima"}
        </p>

        {data && (
          <motion.div
            key={data.toDateString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-2"
          >
            {horarios.map(({ slot, disponivel }) => (
              <HorarioBtn
                key={slot}
                slot={slot}
                disponivel={disponivel}
                selecionado={horario === slot}
                onSelecionar={onHorarioChange}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA h-14 */}
      <button
        onClick={onAvancar}
        disabled={!podeAvancar}
        className={cn(
          "h-14 w-full mt-5 font-mono text-sm font-bold tracking-[0.2em] uppercase",
          "transition-all duration-300",
          podeAvancar
            ? "text-[#0B0B0B] bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_32px_0_#C9A84C50] active:scale-[0.98]"
            : "text-[#6B6760] bg-[#1A1A1A] cursor-not-allowed"
        )}
      >
        {podeAvancar
          ? `Continuar — ${data?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às ${horario}`
          : "Selecione data e horário"}
      </button>
    </div>
  );
}

/* ─── Botão de dia no carrossel ──────────────────────────────────── */
function DiaBtn({
  dia,
  selecionado,
  onSelecionar,
}: {
  dia:          Date;
  selecionado:  boolean;
  onSelecionar: (d: Date) => void;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const isHoje = dia.toDateString() === hoje.toDateString();

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={() => onSelecionar(dia)}
      className={cn(
        "flex-none flex flex-col items-center gap-1 w-[52px] py-3 rounded-xl border",
        "transition-all duration-200",
        selecionado
          ? "bg-amber-500 border-amber-500 text-[#0B0B0B] shadow-[0_0_16px_#C9A84C40]"
          : [
              "bg-[#0F0F0F]/80 border-[#1E1E1E] hover:border-[#C9A84C40]",
              isHoje ? "text-[#C9A84C]" : "text-[#6B6760] hover:text-[#A8A49E]",
            ]
      )}
    >
      {/* Dia da semana */}
      <span className={cn(
        "font-mono text-[8px] tracking-[0.15em] uppercase",
        selecionado ? "text-[#0B0B0B]" : "text-[#3A3A3A]"
      )}>
        {DIA_CURTO[dia.getDay()]}
      </span>

      {/* Número do dia */}
      <span className="font-display text-xl font-semibold leading-none">
        {dia.getDate()}
      </span>

      {/* Mês */}
      <span className={cn(
        "font-mono text-[8px] tracking-wider",
        selecionado ? "text-[#0B0B0B80]" : "text-[#3A3A3A]"
      )}>
        {MES_CURTO[dia.getMonth()]}
      </span>

      {/* Ponto indicador de hoje */}
      {isHoje && !selecionado && (
        <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
      )}
    </motion.button>
  );
}

/* ─── Botão de horário — com linha diagonal se indisponível ─────── */
function HorarioBtn({
  slot,
  disponivel,
  selecionado,
  onSelecionar,
}: {
  slot:         string;
  disponivel:   boolean;
  selecionado:  boolean;
  onSelecionar: (s: string) => void;
}) {
  return (
    <button
      onClick={() => disponivel && onSelecionar(slot)}
      disabled={!disponivel}
      className={cn(
        "relative h-12 text-xs font-mono tracking-wide rounded-lg border overflow-hidden",
        "transition-all duration-200",
        selecionado  && "bg-amber-500 border-amber-500 text-[#0B0B0B] shadow-[0_0_12px_#C9A84C30]",
        !selecionado && disponivel  && "border-[#2A2A2A] text-[#A8A49E] hover:border-[#C9A84C50] hover:text-[#F0EDE8] hover:bg-[#C9A84C08]",
        !disponivel  && "border-[#141414] text-[#2A2A2A] cursor-not-allowed"
      )}
    >
      {/* Linha diagonal para slots ocupados */}
      {!disponivel && (
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, #1E1E1E 4px, #1E1E1E 5px)",
          }}
        />
      )}
      <span className="relative z-10">{slot}</span>
    </button>
  );
}
