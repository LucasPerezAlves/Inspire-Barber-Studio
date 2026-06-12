"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, TrendingUp, Clock, CheckCircle2,
  MessageCircle, Lock, ChevronRight, X, Edit2,
  Check, Scissors, AlertTriangle, LogOut, KeyRound, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────────── */
type Status = "confirmado" | "concluido" | "bloqueado";

interface Agendamento {
  id: string;
  horario: string;
  cliente: string;
  whatsapp: string;
  servico: string;
  duracao: number;
  preco: number;
  status: Status;
  tags: string[];
}

interface BarbeiroData {
  slug: string;
  nome: string;
  especialidade: string;
  agendamentos: Agendamento[];
}

/* ── Mock: dados por profissional ───────────────────────────────── */
const DADOS: Record<string, BarbeiroData> = {
  pablo: {
    slug: "pablo",
    nome: "Pablo de Oliveira",
    especialidade: "Corte Degradê · Fade · Estilo Moderno",
    agendamentos: [
      {
        id: "p1", horario: "09:00", cliente: "Carlos Mendes",
        whatsapp: "5547991234567", servico: "Corte Degradê",
        duracao: 30, preco: 45, status: "concluido",
        tags: ["Degradê Navalhado", "Risco no Cabelo"],
      },
      {
        id: "p2", horario: "09:45", cliente: "Rafael Souza",
        whatsapp: "5547987654321", servico: "Cabelo + Barba na Máquina",
        duracao: 50, preco: 70, status: "concluido",
        tags: ["Degradê Médio", "Barba Cerrada"],
      },
      {
        id: "p3", horario: "11:00", cliente: "Thiago Lima",
        whatsapp: "5547999887766", servico: "Corte Social",
        duracao: 30, preco: 45, status: "confirmado",
        tags: ["Corte Social", "Risco na Sobrancelha"],
      },
      {
        id: "p4", horario: "14:00", cliente: "Marcos Vieira",
        whatsapp: "5547988776655", servico: "Platinado / Nevou + Corte",
        duracao: 90, preco: 150, status: "confirmado",
        tags: ["Platinado / Nevou", "Corte na Tesoura"],
      },
      {
        id: "p5", horario: "16:00", cliente: "Pedro Almeida",
        whatsapp: "5547977665544", servico: "Corte Degradê",
        duracao: 30, preco: 45, status: "confirmado",
        tags: ["Degradê Navalhado", "Buzz Cut"],
      },
      {
        id: "p6", horario: "17:00", cliente: "—",
        whatsapp: "", servico: "Bloqueado",
        duracao: 60, preco: 0, status: "bloqueado", tags: [],
      },
      {
        id: "p7", horario: "18:00", cliente: "Bruno Costa",
        whatsapp: "5547966554433", servico: "Cabelo + Barba na Navalha",
        duracao: 60, preco: 80, status: "confirmado",
        tags: ["Degradê Navalhado", "Barba Quadrada", "Toalha Quente"],
      },
    ],
  },
  altamiro: {
    slug: "altamiro",
    nome: "Altamiro Peixer",
    especialidade: "Barba · Navalha · Transformações",
    agendamentos: [
      {
        id: "a1", horario: "09:00", cliente: "Fernando Reis",
        whatsapp: "5547912345678", servico: "Barba na Navalha",
        duracao: 30, preco: 45, status: "concluido",
        tags: ["Barba Esculpida", "Toalha Quente"],
      },
      {
        id: "a2", horario: "09:45", cliente: "Gustavo Nunes",
        whatsapp: "5547923456789", servico: "Cabelo + Barba na Navalha",
        duracao: 60, preco: 80, status: "concluido",
        tags: ["Barba Lenhador", "Degradê Médio"],
      },
      {
        id: "a3", horario: "11:00", cliente: "Diego Moura",
        whatsapp: "5547934567890", servico: "Barba na Navalha",
        duracao: 30, preco: 45, status: "confirmado",
        tags: ["Barba Quadrada", "Toalha Quente"],
      },
      {
        id: "a4", horario: "12:00", cliente: "—",
        whatsapp: "", servico: "Bloqueado",
        duracao: 60, preco: 0, status: "bloqueado", tags: [],
      },
      {
        id: "a5", horario: "14:30", cliente: "Lucas Faria",
        whatsapp: "5547945678901", servico: "Cabelo + Barba + Sobrancelha",
        duracao: 75, preco: 90, status: "confirmado",
        tags: ["Barba Esculpida", "Sobrancelha Navalhada", "Risco na Sobrancelha"],
      },
      {
        id: "a6", horario: "16:00", cliente: "Ricardo Pinto",
        whatsapp: "5547956789012", servico: "Barba na Navalha",
        duracao: 30, preco: 45, status: "confirmado",
        tags: ["Ganha-pão / Cavanhaque"],
      },
      {
        id: "a7", horario: "17:30", cliente: "Henrique Luz",
        whatsapp: "5547967890123", servico: "Cabelo + Barba na Navalha",
        duracao: 60, preco: 80, status: "confirmado",
        tags: ["Barba Cerrada", "Degradê Navalhado"],
      },
    ],
  },
};

const TODOS_SLUGS = Object.keys(DADOS);

/* ── Equipe para controle de permissões ─────────────────────────── */
interface Membro {
  id: string;
  nome: string;
  cargo: string;
  admin: boolean;
}

const EQUIPE_INICIAL: Membro[] = [
  { id: "altamiro", nome: "Altamiro Peixer",  cargo: "Barbeiro Sênior", admin: true  },
  { id: "mateus",   nome: "Mateus Silva",      cargo: "Barbeiro",        admin: true  },
  { id: "thiago",   nome: "Thiago Costa",      cargo: "Barbeiro Junior",  admin: false },
];

/* ── Helpers ────────────────────────────────────────────────────── */
function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

const STATUS_CONFIG: Record<Status, { label: string; cls: string }> = {
  confirmado: {
    label: "Confirmado",
    cls: "text-[#C9A84C] border-[#C9A84C40] bg-[#C9A84C08]",
  },
  concluido: {
    label: "Concluído",
    cls: "text-[#4ADE80] border-[#4ADE8030] bg-[#4ADE8008]",
  },
  bloqueado: {
    label: "Bloqueado",
    cls: "text-[#6B6760] border-[#2A2A2A] bg-[#1A1A1A]",
  },
};

/* ══════════════════════════════════════════════════════════════════
   Componente principal exportado
══════════════════════════════════════════════════════════════════ */
export function AdminPanel({ slug }: { slug: string }) {
  const dados = DADOS[slug.toLowerCase()];

  if (!dados) return <ProfissionalNaoEncontrado slug={slug} />;

  return <Dashboard dados={dados} />;
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard interativo
══════════════════════════════════════════════════════════════════ */
function Dashboard({ dados }: { dados: BarbeiroData }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(dados.agendamentos);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [modalPermissoes, setModalPermissoes] = useState(false);

  /* reinicia quando o profissional muda (navegação entre slugs) */
  useEffect(() => {
    setAgendamentos(dados.agendamentos);
  }, [dados]);

  /* ── Métricas ──────────────────────────────────────────────── */
  const ativos      = agendamentos.filter((a) => a.status !== "bloqueado");
  const faturamento = ativos.reduce((acc, a) => acc + a.preco, 0);
  const minCadeira  = ativos.reduce((acc, a) => acc + a.duracao, 0);
  const hh = Math.floor(minCadeira / 60);
  const mm = minCadeira % 60;

  const mudarStatus = (id: string, status: Status) =>
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const adicionarBloqueio = (horario: string, descricao: string) => {
    const novo: Agendamento = {
      id: `bl-${Date.now()}`,
      horario,
      cliente: "—",
      whatsapp: "",
      servico: `Bloqueado • ${descricao}`,
      duracao: 60,
      preco: 0,
      status: "bloqueado",
      tags: [],
    };
    setAgendamentos((prev) =>
      [...prev, novo].sort((a, b) => a.horario.localeCompare(b.horario))
    );
    setModalBloqueio(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,#C9A84C05_0%,transparent_65%)] pointer-events-none" />

      {/* ── Barra de navegação administrativa (full-width) ───── */}
      <TeamSwitcher atual={dados.slug} />

      <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-28 z-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6 mt-4">
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#6B6760] mb-1">
            Painel Administrativo
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-semibold text-[#F0EDE8] leading-tight">
                Cadeira de{" "}
                <span className="text-gradient-gold">
                  {dados.nome.split(" ")[0]}
                </span>
              </h1>
              <p className="text-[11px] text-[#6B6760] mt-0.5">{dados.especialidade}</p>
            </div>
            <p className="text-[11px] text-[#6B6760] text-right capitalize shrink-0 leading-tight">
              {todayLabel()}
            </p>
          </div>

          {/* Botão exclusivo do dono */}
          {dados.slug === "pablo" && (
            <motion.button
              onClick={() => setModalPermissoes(true)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "mt-4 flex items-center gap-2 px-4 py-2",
                "border border-[#C9A84C40] text-[#C9A84C]",
                "text-[11px] font-semibold tracking-[0.15em] uppercase",
                "hover:bg-[#C9A84C10] hover:border-[#C9A84C80]",
                "transition-all duration-200"
              )}
            >
              <KeyRound className="w-3.5 h-3.5" strokeWidth={1.5} />
              Gerenciar Permissões 🔑
            </motion.button>
          )}
        </div>

        {/* ── Métricas ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <MetricCard
            icon={<CalendarDays className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Hoje"
            value={String(ativos.length)}
            sub="horários"
          />
          <MetricCard
            icon={<TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Estimado"
            value={formatarPreco(faturamento)}
            sub="faturamento"
            dourado
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Cadeira"
            value={`${hh}h${mm > 0 ? ` ${mm}m` : ""}`}
            sub="tempo total"
          />
        </div>

        {/* ── Separador de seção ──────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#6B6760] shrink-0">
            Agenda do Dia
          </p>
          <div className="flex-1 h-px bg-[#1A1A1A]" />
          <span className="text-[10px] text-[#3A3A3A] tabular-nums">
            {agendamentos.filter((a) => a.status === "confirmado").length} pendentes
          </span>
        </div>

        {/* ── Timeline ────────────────────────────────────────── */}
        <AgendaTimeline
          agendamentos={agendamentos}
          onMudarStatus={mudarStatus}
        />
      </div>

      {/* ── FAB Bloquear ────────────────────────────────────────── */}
      <motion.button
        onClick={() => setModalBloqueio(true)}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed bottom-6 right-4 z-40",
          "flex items-center gap-2 px-4 py-3",
          "bg-[#111111] border border-[#2A2A2A]",
          "text-[11px] font-semibold tracking-wider uppercase text-[#6B6760]",
          "shadow-[0_8px_32px_0_#000000A0]",
          "hover:border-[#C9A84C40] hover:text-[#C9A84C]",
          "transition-all duration-200"
        )}
      >
        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
        Bloquear Minha Agenda
      </motion.button>

      {/* ── Modal de bloqueio ────────────────────────────────────── */}
      <AnimatePresence>
        {modalBloqueio && (
          <BloqueioModal
            nomeBarbeiro={dados.nome.split(" ")[0]}
            onClose={() => setModalBloqueio(false)}
            onConfirmar={adicionarBloqueio}
          />
        )}
      </AnimatePresence>

      {/* ── Modal de permissões (owner only) ─────────────────────── */}
      <AnimatePresence>
        {modalPermissoes && (
          <ModalPermissoes onClose={() => setModalPermissoes(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PermissaoSwitch — toggle animado
══════════════════════════════════════════════════════════════════ */
function PermissaoSwitch({ ativo, onToggle }: { ativo: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-checked={ativo}
      role="switch"
      className={cn(
        "relative w-10 h-5 shrink-0 rounded-full transition-colors duration-300 focus:outline-none",
        ativo ? "bg-[#C9A84C]" : "bg-[#2A2A2A]"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-[#F0EDE8] shadow",
          ativo ? "left-[calc(100%-18px)]" : "left-0.5"
        )}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ModalPermissoes — controle de acesso (owner only)
══════════════════════════════════════════════════════════════════ */
function ModalPermissoes({ onClose }: { onClose: () => void }) {
  const [equipe, setEquipe] = useState<Membro[]>(EQUIPE_INICIAL);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setEquipe((prev) =>
      prev.map((m) => (m.id === id ? { ...m, admin: !m.admin } : m))
    );
    setFeedbackId(id);
    setTimeout(() => setFeedbackId(null), 1800);
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        key="overlay-perm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        key="modal-perm"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-[#121212] border border-[#1E1E1E] overflow-hidden"
      >
        {/* Barra dourada */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <div className="px-5 py-5">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-[#C9A84C10] border border-[#C9A84C30]">
                <Users className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-[#F0EDE8] leading-tight">
                  Controle de Acesso
                </h2>
                <p className="text-[10px] text-[#6B6760] tracking-wider uppercase mt-0.5">
                  Barbearia · Equipe
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B6760] hover:text-[#F0EDE8] transition-colors mt-0.5"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Lista de profissionais */}
          <div className="space-y-1">
            {equipe.map((membro) => (
              <div key={membro.id}>
                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F0EDE8] font-medium truncate">
                      {membro.nome}
                    </p>
                    <p className="text-[10px] text-[#6B6760] mt-0.5">{membro.cargo}</p>
                  </div>

                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {/* Badge de status */}
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase border",
                        membro.admin
                          ? "text-[#C9A84C] border-[#C9A84C40] bg-[#C9A84C08]"
                          : "text-[#6B6760] border-[#2A2A2A] bg-transparent"
                      )}
                    >
                      {membro.admin ? "Admin" : "Inativo"}
                    </span>

                    <PermissaoSwitch
                      ativo={membro.admin}
                      onToggle={() => toggle(membro.id)}
                    />
                  </div>
                </div>

                {/* Feedback animado */}
                <AnimatePresence>
                  {feedbackId === membro.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 px-1 py-1.5">
                        <Check className="w-3 h-3 text-[#4ADE80]" strokeWidth={2.5} />
                        <span className="text-[10px] text-[#4ADE80]">
                          Permissão atualizada com sucesso
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <p className="text-[10px] text-[#3A3A3A] mt-5 text-center">
            Alterações aplicadas instantaneamente · Inspire Barber Studio
          </p>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TeamSwitcher — barra de navegação administrativa full-width
══════════════════════════════════════════════════════════════════ */
function TeamSwitcher({ atual }: { atual: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full h-16 px-6 bg-[#0B0B0B] border-b border-neutral-800 relative z-10">

      {/* Esquerda: seletor de profissional via <Link> */}
      <div className="flex items-center gap-3">
        {TODOS_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200",
              slug === atual
                ? "text-[#0B0B0B] bg-[#C9A84C]"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {DADOS[slug].nome.split(" ")[0]}
          </Link>
        ))}
      </div>

      {/* Direita: logout */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => {
            try { sessionStorage.removeItem("inspire_admin_session"); } catch {}
            router.push("/admin");
          }}
          className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 hover:text-amber-500 transition-colors cursor-pointer"
        >
          Sair
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MetricCard
══════════════════════════════════════════════════════════════════ */
function MetricCard({
  icon, label, value, sub, dourado = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  dourado?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-[#121212] border p-3 flex flex-col gap-1",
        dourado ? "border-[#C9A84C20]" : "border-[#1E1E1E]"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] text-[#6B6760] tracking-wider uppercase truncate">
          {label}
        </span>
      </div>
      <p className={cn(
        "font-display font-semibold leading-tight break-all",
        dourado ? "text-[#C9A84C] text-[13px]" : "text-[#F0EDE8] text-lg"
      )}>
        {value}
      </p>
      <p className="text-[9px] text-[#3A3A3A] tracking-wide">{sub}</p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AgendaTimeline
══════════════════════════════════════════════════════════════════ */
function AgendaTimeline({
  agendamentos,
  onMudarStatus,
}: {
  agendamentos: Agendamento[];
  onMudarStatus: (id: string, s: Status) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-[38px] top-5 bottom-5 w-px bg-gradient-to-b from-[#C9A84C20] via-[#1E1E1E] to-transparent" />
      <div className="space-y-2.5">
        {agendamentos.map((ag, i) => (
          <motion.div
            key={ag.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
          >
            <AgendamentoCard ag={ag} onMudarStatus={onMudarStatus} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── AgendamentoCard ────────────────────────────────────────────── */
function AgendamentoCard({
  ag,
  onMudarStatus,
}: {
  ag: Agendamento;
  onMudarStatus: (id: string, s: Status) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const { label, cls } = STATUS_CONFIG[ag.status];
  const bloqueado = ag.status === "bloqueado";

  const waUrl = ag.whatsapp
    ? `https://wa.me/${ag.whatsapp}?text=${encodeURIComponent(
        `Olá ${ag.cliente}! Passando para informar um aviso sobre seu agendamento das ${ag.horario} aqui na Inspire Barber Studio.`
      )}`
    : null;

  return (
    <div className="flex gap-3 items-start">

      {/* Horário + marcador */}
      <div className="w-[76px] shrink-0 flex flex-col items-center gap-1.5 pt-3">
        <span className={cn(
          "font-display text-sm font-semibold tabular-nums",
          bloqueado ? "text-[#2E2E2E]" : "text-[#C9A84C]"
        )}>
          {ag.horario}
        </span>
        <div className={cn(
          "w-2.5 h-2.5 rounded-full border-2 z-10",
          ag.status === "concluido"  ? "bg-[#4ADE80] border-[#4ADE80]" :
          ag.status === "confirmado" ? "bg-[#C9A84C] border-[#C9A84C]" :
                                       "bg-[#1A1A1A] border-[#2A2A2A]"
        )} />
      </div>

      {/* Card */}
      <div className={cn(
        "flex-1 bg-[#121212] border overflow-hidden",
        bloqueado ? "border-[#161616] opacity-40" : "border-[#1E1E1E]"
      )}>
        <button
          className="w-full text-left p-3"
          onClick={() => !bloqueado && setExpandido((v) => !v)}
          disabled={bloqueado}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 mb-1.5",
                "text-[10px] font-semibold border",
                cls
              )}>
                {label}
              </span>
              <p className={cn(
                "font-semibold text-sm leading-tight truncate",
                bloqueado ? "text-[#2E2E2E]" : "text-[#F0EDE8]"
              )}>
                {bloqueado ? "Horário indisponível" : ag.cliente}
              </p>
              <p className="text-[11px] text-[#6B6760] mt-0.5 truncate">
                {ag.servico}
              </p>
            </div>
            {!bloqueado && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display text-sm font-semibold text-[#C9A84C]">
                  {formatarPreco(ag.preco)}
                </span>
                <motion.div
                  animate={{ rotate: expandido ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-[#3A3A3A]" strokeWidth={1.5} />
                </motion.div>
              </div>
            )}
          </div>
        </button>

        {/* Detalhe expandido */}
        <AnimatePresence initial={false}>
          {expandido && !bloqueado && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-[#1A1A1A] px-3 pt-3 pb-3 space-y-3">

                {/* Tags de preferência */}
                {ag.tags.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#2E2E2E] mb-1.5">
                      Preferências do Cliente
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ag.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 text-[10px] text-[#C9A84C70] border border-[#C9A84C18] bg-[#C9A84C06]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2",
                        "text-[11px] font-semibold text-[#4ADE80]",
                        "border border-[#4ADE8025] bg-[#4ADE8008]",
                        "active:scale-95 transition-all duration-150"
                      )}
                    >
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      WhatsApp
                    </a>
                  )}

                  {ag.status === "confirmado" && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onMudarStatus(ag.id, "concluido")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2",
                        "text-[11px] font-semibold text-[#C9A84C]",
                        "border border-[#C9A84C30] bg-[#C9A84C08]",
                        "hover:bg-[#C9A84C12] transition-colors"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      Concluir
                    </motion.button>
                  )}

                  {ag.status === "concluido" && (
                    <button
                      onClick={() => onMudarStatus(ag.id, "confirmado")}
                      className="text-[10px] text-[#3A3A3A] hover:text-[#6B6760] transition-colors px-2 py-1"
                    >
                      ↩ Reverter
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BloqueioModal
══════════════════════════════════════════════════════════════════ */
function BloqueioModal({
  nomeBarbeiro,
  onClose,
  onConfirmar,
}: {
  nomeBarbeiro: string;
  onClose: () => void;
  onConfirmar: (horario: string, descricao: string) => void;
}) {
  const [data,   setData]   = useState("");
  const [inicio, setInicio] = useState("14:00");
  const [fim,    setFim]    = useState("16:00");

  const hoje = new Date().toISOString().split("T")[0];

  const confirmar = () => {
    if (!data) return;
    const dLabel = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "short", day: "2-digit", month: "short",
    });
    onConfirmar(inicio, `${dLabel} • ${inicio}–${fim}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2A2A2A] max-w-2xl mx-auto"
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-4 mb-5" />

        <div className="px-5 pb-10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#6B6760]" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold text-[#F0EDE8]">
                  Bloquear Horário
                </h3>
              </div>
              <p className="text-[11px] text-[#6B6760] mt-0.5">
                Agenda de {nomeBarbeiro}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B6760] hover:text-[#A8A49E] transition-colors p-1"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2">
              Data
            </label>
            <input
              type="date"
              min={hoje}
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Das", value: inicio, set: setInicio },
              { label: "Até", value: fim,    set: setFim    },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2">
                  {label}
                </label>
                <input
                  type="time"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={confirmar}
            disabled={!data}
            className={cn(
              "w-full py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300",
              data
                ? "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] active:scale-[0.98]"
                : "text-[#3A3A3A] bg-[#1A1A1A] cursor-not-allowed"
            )}
          >
            Confirmar Bloqueio
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Página 404 — Profissional não encontrado
══════════════════════════════════════════════════════════════════ */
function ProfissionalNaoEncontrado({ slug }: { slug: string }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-sm"
      >
        <div className="w-14 h-14 flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] mx-auto mb-6">
          <AlertTriangle className="w-6 h-6 text-[#6B6760]" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-2xl font-semibold text-[#F0EDE8] mb-2">
          Profissional não encontrado
        </h1>
        <p className="text-[#6B6760] text-sm leading-relaxed mb-1">
          Nenhum profissional mapeado com o slug{" "}
          <code className="text-[#C9A84C] bg-[#C9A84C10] px-1.5 py-0.5 text-[11px]">
            {slug}
          </code>
          .
        </p>
        <p className="text-[#3A3A3A] text-xs mb-8">
          Slugs disponíveis:{" "}
          {TODOS_SLUGS.map((s) => (
            <Link
              key={s}
              href={`/admin/${s}`}
              className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors"
            >
              /admin/{s}{" "}
            </Link>
          ))}
        </p>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0B0B0B] text-sm font-semibold tracking-[0.15em] uppercase hover:bg-[#E6C97A] transition-all duration-300"
        >
          <Scissors className="w-4 h-4" strokeWidth={2} />
          Ver Equipe
        </Link>
      </motion.div>
    </div>
  );
}
