"use client";

import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getHorariosDisponiveis, BARBEARIA } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EtapaDataHorarioProps {
  data: Date | undefined;
  horario: string | null;
  onDataChange: (data: Date | undefined) => void;
  onHorarioChange: (horario: string) => void;
  onAvancar: () => void;
}

/** Dias desabilitados: passado, domingo (0), segunda (1) */
function isDiaDesabilitado(dia: Date): boolean {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dow = dia.getDay();
  return dia < hoje || !BARBEARIA.diasFuncionamento.includes(dow);
}

export function EtapaDataHorario({
  data,
  horario,
  onDataChange,
  onHorarioChange,
  onAvancar,
}: EtapaDataHorarioProps) {
  const horarios = data ? getHorariosDisponiveis(data) : [];
  const podeAvancar = !!data && !!horario;

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

      {/* ── Calendário ─────────────────────────────────────────── */}
      {/* p-2 mobile para dar mais espaço ao calendário; p-4 desktop */}
      <div className="bg-[#111111] border border-[#1E1E1E] p-2 sm:p-4 mb-4">
        <Calendar
          mode="single"
          selected={data}
          onSelect={onDataChange}
          locale={ptBR}
          disabled={isDiaDesabilitado}
          fromDate={new Date()}
          className="w-full"
        />

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1A1A1A]">
          <LegendaItem cor="bg-[#C9A84C]" label="Selecionado" />
          <LegendaItem cor="border border-[#C9A84C40]" label="Hoje" />
          <LegendaItem cor="bg-[#1A1A1A] opacity-30" label="Indisponível" />
        </div>
      </div>

      {/* ── Grade de horários ───────────────────────────────────── */}
      <div
        className={cn(
          "bg-[#111111] border border-[#1E1E1E] p-4",
          "transition-opacity duration-300",
          !data && "opacity-40 pointer-events-none"
        )}
      >
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#6B6760] mb-4 flex items-center gap-2">
          <Clock className="w-3 h-3 text-[#C9A84C]" />
          {data
            ? `Horários — ${data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}`
            : "Selecione uma data"}
        </p>

        {data && (
          <motion.div
            key={data.toDateString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            /* 3 colunas mobile (botões mais largos), 6 colunas desktop */
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

      {/* CTA */}
      <button
        onClick={onAvancar}
        disabled={!podeAvancar}
        className={cn(
          "w-full mt-5 py-4 text-sm font-semibold tracking-[0.15em] uppercase",
          "transition-all duration-300",
          podeAvancar
            ? "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C40] active:scale-[0.98]"
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

/* ─── Botão de horário ────────────────────────────────────────── */
function HorarioBtn({
  slot,
  disponivel,
  selecionado,
  onSelecionar,
}: {
  slot: string;
  disponivel: boolean;
  selecionado: boolean;
  onSelecionar: (s: string) => void;
}) {
  return (
    <button
      onClick={() => disponivel && onSelecionar(slot)}
      disabled={!disponivel}
      /* min-h-[48px] garante alvo de toque mínimo (padrão Apple/Google) */
      className={cn(
        "min-h-[48px] px-1 text-xs font-semibold tracking-wide",
        "border transition-all duration-200",
        selecionado && "bg-[#C9A84C] border-[#C9A84C] text-[#0B0B0B] shadow-[0_0_12px_0_#C9A84C30]",
        !selecionado && disponivel && "border-[#2A2A2A] text-[#A8A49E] hover:border-[#C9A84C50] hover:text-[#F0EDE8] hover:bg-[#C9A84C08]",
        !disponivel && "border-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed line-through"
      )}
    >
      {slot}
    </button>
  );
}

/* ─── Item de legenda ─────────────────────────────────────────── */
function LegendaItem({ cor, label }: { cor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 shrink-0", cor)} />
      <span className="text-[10px] text-[#6B6760]">{label}</span>
    </div>
  );
}
