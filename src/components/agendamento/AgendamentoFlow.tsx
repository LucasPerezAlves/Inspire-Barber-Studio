"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CalendarCheck2 } from "lucide-react";
import { BARBEARIA, SERVICOS, PROFISSIONAIS, formatarPreco, formatarDuracao } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";
import { StepIndicator } from "./StepIndicator";
import { EtapaServicos } from "./steps/EtapaServicos";
import { EtapaProfissional } from "./steps/EtapaProfissional";
import { EtapaDataHorario } from "./steps/EtapaDataHorario";
import { EtapaIdentificacao } from "./steps/EtapaIdentificacao";

/* ─── Tipos ───────────────────────────────────────────────────── */
interface AgendamentoState {
  servicosSelecionados: string[];
  profissionalId: string;
  data: Date | undefined;
  horario: string | null;
  nome: string;
  whatsapp: string;
}

/* ─── Variantes de animação (slide horizontal) ────────────────── */
const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
  }),
};

const TOTAL_ETAPAS = 4;

export function AgendamentoFlow() {
  const [etapa, setEtapa]   = useState(1);
  const [direcao, setDirecao] = useState(1);
  const [confirmado, setConfirmado] = useState(false);

  const [state, setState] = useState<AgendamentoState>({
    servicosSelecionados: [],
    profissionalId: "qualquer",
    data: undefined,
    horario: null,
    nome: "",
    whatsapp: "",
  });

  /* Lê serviços pré-selecionados via "Repetir corte" no perfil */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("inspire_repeat_servicos");
      if (!raw) return;
      sessionStorage.removeItem("inspire_repeat_servicos");
      const ids = JSON.parse(raw) as string[];
      if (ids.length > 0) setState((prev) => ({ ...prev, servicosSelecionados: ids }));
    } catch { /* sessão inválida ou bloqueada — ignora */ }
  }, []);

  /* ─── Navegação ─────────────────────────────────────────────── */
  const irPara = (novaEtapa: number) => {
    setDirecao(novaEtapa > etapa ? 1 : -1);
    setEtapa(novaEtapa);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const avancar = () => irPara(Math.min(etapa + 1, TOTAL_ETAPAS));
  const voltar  = () => irPara(Math.max(etapa - 1, 1));

  /* ─── Handlers de estado ────────────────────────────────────── */
  const toggleServico = (id: string) => {
    setState((prev) => ({
      ...prev,
      servicosSelecionados: prev.servicosSelecionados.includes(id)
        ? prev.servicosSelecionados.filter((s) => s !== id)
        : [...prev.servicosSelecionados, id],
    }));
  };

  const selecionarProfissional = (id: string) => {
    setState((prev) => ({ ...prev, profissionalId: id }));
    setTimeout(() => avancar(), 280);
  };

  const selecionarData = (data: Date | undefined) => {
    setState((prev) => ({ ...prev, data, horario: null }));
  };

  const selecionarHorario = (horario: string) => {
    setState((prev) => ({ ...prev, horario }));
  };

  const atualizarCampo = <K extends keyof AgendamentoState>(
    campo: K,
    valor: AgendamentoState[K]
  ) => {
    setState((prev) => ({ ...prev, [campo]: valor }));
  };

  const confirmar = () => setConfirmado(true);

  /* ─── Resumo calculado ──────────────────────────────────────── */
  const servicosObj = SERVICOS.filter((s) =>
    state.servicosSelecionados.includes(s.id)
  );
  const totalPreco   = servicosObj.reduce((acc, s) => acc + s.preco, 0);
  const totalDuracao = servicosObj.reduce((acc, s) => acc + s.duracao, 0);
  const profissional = PROFISSIONAIS.find((p) => p.id === state.profissionalId);

  /* ─── Tela de confirmação ───────────────────────────────────── */
  if (confirmado) {
    const msgWhatsApp = [
      `Olá! Gostaria de confirmar meu agendamento:`,
      ``,
      `*Serviços:* ${servicosObj.map((s) => s.nome).join(", ")}`,
      `*Profissional:* ${profissional?.nome ?? "Qualquer"}`,
      `*Data:* ${state.data?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) ?? ""}`,
      `*Horário:* ${state.horario}`,
      `*Total:* ${formatarPreco(totalPreco)}`,
      ``,
      `Nome: ${state.nome}`,
      `WhatsApp: ${state.whatsapp}`,
    ].join("\n");

    const waUrl = `https://wa.me/${BARBEARIA.whatsapp}?text=${encodeURIComponent(msgWhatsApp)}`;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[#C9A84C10] border border-[#C9A84C30] flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#C9A84C]" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F0EDE8] mb-3">
          Agendamento Enviado!
        </h2>
        <p className="text-[#A8A49E] text-sm leading-relaxed max-w-sm mb-8">
          Clique abaixo para confirmar via WhatsApp. Nossa equipe vai retornar em instantes.
        </p>

        {/* Resumo card */}
        <div className="w-full max-w-sm bg-[#121212] border border-[#2A2A2A] p-5 mb-8 text-left space-y-3">
          {servicosObj.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-[#A8A49E]">{s.nome}</span>
              <span className="text-[#C9A84C] font-semibold">{formatarPreco(s.preco)}</span>
            </div>
          ))}
          <div className="divider-gold" />
          <div className="flex items-center justify-between">
            <span className="text-[#F0EDE8] font-semibold">Total</span>
            <span className="font-display text-xl text-[#C9A84C] font-semibold">{formatarPreco(totalPreco)}</span>
          </div>
          <div className="text-xs text-[#6B6760] flex items-center gap-4 pt-1">
            <span>{state.data?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) ?? ""} às {state.horario}</span>
            <span>{profissional?.nome}</span>
          </div>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-sm">
          <button className="w-full py-4 text-sm font-semibold tracking-[0.15em] uppercase text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C40] transition-all duration-300 active:scale-[0.98]">
            Confirmar no WhatsApp
          </button>
        </a>
        <button
          onClick={() => { setConfirmado(false); setEtapa(1); setState({ servicosSelecionados: [], profissionalId: "qualquer", data: undefined, horario: null, nome: "", whatsapp: "" }); }}
          className="mt-4 text-xs text-[#6B6760] hover:text-[#A8A49E] transition-colors"
        >
          Novo agendamento
        </button>
      </motion.div>
    );
  }

  /* ─── Render principal ──────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B]">

      {/* ── Header glassmorphism com logo ──────────────────────── */}
      {/* top-20 → posiciona abaixo da Navbar principal (h-20) */}
      <header className="sticky top-20 z-40 glass border-b border-[#C9A84C12]">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={etapa === 1 ? () => window.history.back() : voltar}
            aria-label="Voltar"
            className={cn(
              "w-8 h-8 flex items-center justify-center shrink-0",
              "border border-[#2A2A2A] text-[#6B6760]",
              "hover:border-[#C9A84C40] hover:text-[#C9A84C]",
              "transition-all duration-200"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Logo + nome */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-full border border-[#C9A84C30]">
              <Image
                src={BARBEARIA.logo}
                alt={BARBEARIA.nome}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-[#F0EDE8] leading-tight truncate">
                {BARBEARIA.nome}
              </p>
              <p className="text-[10px] text-[#6B6760] tracking-wider uppercase">
                Agendamento Online
              </p>
            </div>
          </div>

          {/* Step counter */}
          <span className="shrink-0 text-[11px] text-[#6B6760] font-medium">
            <span className="text-[#C9A84C]">{etapa}</span>/{TOTAL_ETAPAS}
          </span>
        </div>
      </header>

      {/* ── Step indicator ─────────────────────────────────────── */}
      {/* top-[136px] = Navbar (80px) + booking header (56px) */}
      <div className="sticky top-[136px] z-30 bg-[#0D0D0D] border-b border-[#1E1E1E]">
        <div className="max-w-2xl mx-auto px-5">
          <StepIndicator etapaAtual={etapa} totalEtapas={TOTAL_ETAPAS} onIrPara={irPara} />
        </div>
      </div>

      {/* ── Conteúdo das etapas ────────────────────────────────── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-5">
        <AnimatePresence mode="wait" custom={direcao}>
          <motion.div
            key={etapa}
            custom={direcao}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {etapa === 1 && (
              <EtapaServicos
                selecionados={state.servicosSelecionados}
                onToggle={toggleServico}
                onAvancar={avancar}
                totalPreco={totalPreco}
                totalDuracao={totalDuracao}
              />
            )}
            {etapa === 2 && (
              <EtapaProfissional
                profissionalId={state.profissionalId}
                onSelecionar={selecionarProfissional}
              />
            )}
            {etapa === 3 && (
              <EtapaDataHorario
                data={state.data}
                horario={state.horario}
                onDataChange={selecionarData}
                onHorarioChange={selecionarHorario}
                onAvancar={avancar}
              />
            )}
            {etapa === 4 && (
              <EtapaIdentificacao
                nome={state.nome}
                whatsapp={state.whatsapp}
                onNomeChange={(v) => atualizarCampo("nome", v)}
                onWhatsappChange={(v) => atualizarCampo("whatsapp", v)}
                onConfirmar={confirmar}
                servicosObj={servicosObj}
                profissional={profissional ?? PROFISSIONAIS[0]}
                data={state.data}
                horario={state.horario}
                totalPreco={totalPreco}
                totalDuracao={totalDuracao}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
