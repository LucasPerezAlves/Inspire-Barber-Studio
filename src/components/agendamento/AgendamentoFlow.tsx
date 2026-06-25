"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BARBEARIA, SERVICOS, PROFISSIONAIS, formatarPreco } from "@/data/agendamento-dados";
import { sanitizeText, sanitizePhone } from "@/lib/sanitize";
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

  /* ─── Tela de confirmação — "wow" effect ────────────────────────── */
  if (confirmado) {
    /* Sanitiza antes de embeddar na mensagem — defesa XSS */
    const nomeSeguro = sanitizeText(state.nome);
    const foneSeguro = sanitizePhone(state.whatsapp);

    const msgWhatsApp = [
      `Olá! Gostaria de confirmar meu agendamento:`,
      ``,
      `*Serviços:* ${servicosObj.map((s) => s.nome).join(", ")}`,
      `*Profissional:* ${profissional?.nome ?? "Qualquer"}`,
      `*Data:* ${state.data?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) ?? ""}`,
      `*Horário:* ${state.horario}`,
      `*Total:* ${formatarPreco(totalPreco)}`,
      ``,
      `Nome: ${nomeSeguro}`,
      `WhatsApp: ${foneSeguro}`,
    ].join("\n");

    const waUrl = `https://wa.me/${BARBEARIA.whatsapp}?text=${encodeURIComponent(msgWhatsApp)}`;

    const staggerContainer = {
      hidden: {},
      show:   { transition: { staggerChildren: 0.09, delayChildren: 0.55 } },
    };
    const staggerItem = {
      hidden: { opacity: 0, y: 16 },
      show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-[70vh] flex flex-col items-center justify-start px-5 pt-10 pb-20"
      >
        {/* Check circle com glow pulsante */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 #C9A84C40", "0 0 0 28px #C9A84C00"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            className="w-20 h-20 rounded-full bg-[#C9A84C0D] border border-[#C9A84C30] flex items-center justify-center"
          >
            <CheckCircle2 className="w-9 h-9 text-[#C9A84C]" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F0EDE8] mb-2">
            Agendamento Enviado!
          </h2>
          <p className="font-mono text-[11px] text-[#6B6760] tracking-wide leading-relaxed">
            Confirme pelo WhatsApp — respondemos em instantes
          </p>
        </motion.div>

        {/* Divisor dourado */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.45, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-px bg-[#C9A84C] mb-7"
        />

        {/* Cards de detalhes em stagger */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm space-y-2 mb-8"
        >
          {servicosObj.map((s) => (
            <motion.div
              key={s.id}
              variants={staggerItem}
              className="flex items-center justify-between px-4 py-3 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl"
            >
              <span className="text-sm text-[#A8A49E]">{s.nome}</span>
              <span className="text-sm text-[#C9A84C] font-semibold tabular-nums">
                {formatarPreco(s.preco)}
              </span>
            </motion.div>
          ))}

          <motion.div
            variants={staggerItem}
            className="flex items-center justify-between px-4 py-3 bg-[#C9A84C0A] border border-[#C9A84C20] rounded-xl"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">Total</span>
            <span className="font-display text-xl font-semibold text-[#C9A84C]">
              {formatarPreco(totalPreco)}
            </span>
          </motion.div>

          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2">
            <div className="px-4 py-3 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl">
              <p className="font-mono text-[9px] text-[#3A3A3A] tracking-wider uppercase mb-1">Data &amp; Hora</p>
              <p className="text-xs text-[#A8A49E] leading-snug">
                {state.data?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às {state.horario}
              </p>
            </div>
            <div className="px-4 py-3 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl">
              <p className="font-mono text-[9px] text-[#3A3A3A] tracking-wider uppercase mb-1">Profissional</p>
              <p className="text-xs text-[#A8A49E] leading-snug truncate">{profissional?.nome ?? "Qualquer"}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA WhatsApp com fluid fill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-3"
        >
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
            <button className="group relative h-14 w-full overflow-hidden border border-[#C9A84C] font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300">
              <span className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 text-[#C9A84C] group-hover:text-[#0B0B0B] transition-colors duration-300">
                Confirmar no WhatsApp
              </span>
            </button>
          </a>
          <button
            onClick={() => {
              setConfirmado(false);
              setEtapa(1);
              setState({ servicosSelecionados: [], profissionalId: "qualquer", data: undefined, horario: null, nome: "", whatsapp: "" });
            }}
            className="w-full text-center text-xs text-[#3A3A3A] hover:text-[#6B6760] transition-colors"
          >
            Fazer novo agendamento
          </button>
        </motion.div>
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
