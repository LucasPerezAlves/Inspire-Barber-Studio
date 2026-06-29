"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, TrendingUp, Clock, CheckCircle2,
  MessageCircle, Lock, ChevronRight, X,
  Check, Scissors, AlertTriangle, LogOut, Users, Loader2, UserPlus,
  Eye, EyeOff, ImageIcon, Upload, Pencil, Trash2, ShieldCheck, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient, type AgendamentoDB } from "@/lib/supabase";
import { mascaraTelefone } from "@/data/agendamento-dados";

/* Types */
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

interface ProfDB {
  id: string;
  nome: string;
  slug: string;
  especialidade: string | null;
  whatsapp: string | null;
  email: string | null;
  role: "OWNER" | "BARBER";
  foto_url: string | null;
}
type ViewEquipe = "lista" | "cadastro" | "edicao";
interface FormEquipe {
  nome: string; especialidade: string; slug: string;
  whatsapp: string; email: string; senha: string;
}

/* ── Slugs e nomes ───────────────────────────────────────────────── */
const TODOS_SLUGS    = ["pablo", "altamiro"] as const;
const PRIMEIRO_NOME: Record<string, string> = { pablo: "Pablo", altamiro: "Altamiro" };

/* ── Helpers ────────────────────────────────────────────────────── */
function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

const STATUS_CONFIG: Record<Status, { label: string; cls: string }> = {
  confirmado: { label: "Confirmado", cls: "text-[#C9A84C] border-[#C9A84C30] bg-[#C9A84C08]"            },
  concluido:  { label: "Concluído",  cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"      },
  bloqueado:  { label: "Bloqueado",  cls: "text-[#4A4A4A] border-[#1A1A1A] bg-[#141414]"                },
};

function isoToHorario(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
    });
  } catch { return "--:--"; }
}

function mapAgendamento(a: AgendamentoDB): Agendamento {
  return {
    id:       a.id,
    horario:  isoToHorario(a.data_hora),
    cliente:  a.cliente_nome,
    whatsapp: a.cliente_whatsapp ?? "",
    servico:  a.servico,
    duracao:  a.duracao,
    preco:    a.preco,
    status:   a.status,
    tags:     a.tags ?? [],
  };
}

/* ── Shared styles ──────────────────────────────────────────────── */
const FORM_VAZIO: FormEquipe = {
  nome: "", especialidade: "", slug: "", whatsapp: "", email: "", senha: "",
};
const INPUT_CLS = cn(
  "w-full bg-[#0A0A0A] px-4 h-12 sm:h-14 text-base text-[#F0EDE8] rounded-lg",
  "placeholder:text-[#1E1E1E] border border-[#1E1E1E]",
  "focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_0_1px_#C9A84C12] transition-all duration-200"
);
const LABEL_CLS = "block font-mono text-[9px] font-semibold tracking-[0.28em] uppercase text-[#4A4A4A] mb-2";

/* ══════════════════════════════════════════════════════════════════
   AdminPanel — entry point
   Slug vem da URL mas a API ignora para BARBERs (usa JWT)
══════════════════════════════════════════════════════════════════ */
export function AdminPanel({ slug, role }: { slug: string; role: "OWNER" | "BARBER" }) {
  const key = slug.toLowerCase();
  const [dados,      setDados]      = useState<BarbeiroData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    /* IDOR FIX: o servidor lê o slug do JWT para BARBERs,
       ignorando o parâmetro de URL mesmo que seja adulterado. */
    async function fetchPanel() {
      try {
        const res  = await fetch(`/api/admin/painel?slug=${encodeURIComponent(key)}`);
        const json = await res.json() as {
          profissional?: { id: string; nome: string; slug: string; especialidade: string };
          agendamentos?: import("@/lib/supabase").AgendamentoDB[];
          error?: string;
        };

        if (!res.ok || !json.profissional) {
          console.error("[AdminPanel] API retornou erro:", json.error);
          return;
        }

        setDados({
          slug:          json.profissional.slug,
          nome:          json.profissional.nome,
          especialidade: json.profissional.especialidade,
          agendamentos:  (json.agendamentos ?? []).map(mapAgendamento),
        });
      } catch (err) {
        console.error("[AdminPanel] Erro de rede:", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchPanel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (carregando) return <PainelSkeleton />;
  if (!dados)     return <ProfissionalNaoEncontrado slug={slug} />;
  return <Dashboard dados={dados} role={role} />;
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function PainelSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin" strokeWidth={1.5} />
        <p className="font-mono text-[10px] text-[#3A3A3A] tracking-[0.3em] uppercase">Carregando painel…</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard principal
══════════════════════════════════════════════════════════════════ */
function Dashboard({ dados, role }: { dados: BarbeiroData; role: "OWNER" | "BARBER" }) {
  const isOwner = role === "OWNER";
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(dados.agendamentos);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [modalEquipe,   setModalEquipe]   = useState(false);

  useEffect(() => { setAgendamentos(dados.agendamentos); }, [dados]);

  const ativos      = agendamentos.filter((a) => a.status !== "bloqueado");
  const faturamento = ativos.reduce((acc, a) => acc + a.preco, 0);
  const minCadeira  = ativos.reduce((acc, a) => acc + a.duracao, 0);
  const hh = Math.floor(minCadeira / 60);
  const mm = minCadeira % 60;

  const mudarStatus = (id: string, status: Status) =>
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const adicionarBloqueio = (horario: string, descricao: string) => {
    const novo: Agendamento = {
      id: `bl-${Date.now()}`, horario, cliente: "—", whatsapp: "",
      servico: `Bloqueado · ${descricao}`, duracao: 60, preco: 0,
      status: "bloqueado", tags: [],
    };
    setAgendamentos((prev) =>
      [...prev, novo].sort((a, b) => a.horario.localeCompare(b.horario))
    );
    setModalBloqueio(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_55%_25%_at_50%_0%,#C9A84C04_0%,transparent_60%)] pointer-events-none" />

      <TeamSwitcher atual={dados.slug} isOwner={isOwner} />

      <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-28 z-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-7 mt-2">
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#3A3A3A] mb-2">
            Painel Administrativo
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#F0EDE8] leading-tight">
                Cadeira de{" "}
                <span className="text-gradient-gold">{dados.nome.split(" ")[0]}</span>
              </h1>
              <p className="font-mono text-[10px] text-[#4A4A4A] mt-1 tracking-wide">
                {dados.especialidade}
              </p>
            </div>
            <p className="font-mono text-[10px] text-[#3A3A3A] text-right capitalize shrink-0 leading-tight">
              {todayLabel()}
            </p>
          </div>

          {isOwner && (
            <div className="mt-4">
              <motion.button
                onClick={() => setModalEquipe(true)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                  "border border-[#C9A84C25] text-[#C9A84C]",
                  "font-mono text-[10px] font-semibold tracking-[0.15em] uppercase",
                  "hover:bg-[#C9A84C08] hover:border-[#C9A84C50]",
                  "transition-all duration-200"
                )}
              >
                <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                Gerenciar Equipe
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Métricas ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-7">
          <MetricCard
            icon={<CalendarDays className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Hoje" value={String(ativos.length)} sub="atendimentos"
          />
          <MetricCard
            icon={<TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Faturamento" value={formatarPreco(faturamento)} sub="estimado" dourado
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Cadeira" value={`${hh}h${mm > 0 ? `${mm}m` : ""}`} sub="tempo total"
          />
        </div>

        {/* ── Separador ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <p className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[#3A3A3A] shrink-0">
            Agenda do Dia
          </p>
          <div className="flex-1 h-px bg-[#141414]" />
          <span className="font-mono text-[9px] text-[#2A2A2A] tabular-nums">
            {agendamentos.filter((a) => a.status === "confirmado").length} pendentes
          </span>
        </div>

        {/* ── Timeline ────────────────────────────────────────── */}
        {agendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] border border-[#1A1A1A] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-[#2A2A2A]" strokeWidth={1.5} />
            </div>
            <p className="font-mono text-[10px] text-[#2A2A2A] tracking-[0.3em] uppercase">
              Nenhum agendamento para hoje
            </p>
          </div>
        ) : (
          <AgendaTimeline agendamentos={agendamentos} onMudarStatus={mudarStatus} />
        )}
      </div>

      {/* ── FAB — Bloquear ──────────────────────────────────────── */}
      <motion.button
        onClick={() => setModalBloqueio(true)}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed bottom-6 right-4 z-40",
          "flex items-center gap-2 px-4 py-3 rounded-xl",
          "bg-[#0D0D0D] border border-[#1E1E1E]",
          "font-mono text-[10px] font-semibold tracking-wider uppercase text-[#4A4A4A]",
          "shadow-[0_8px_32px_0_#00000090]",
          "hover:border-[#C9A84C30] hover:text-[#C9A84C]",
          "transition-all duration-200"
        )}
      >
        <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
        Bloquear Agenda
      </motion.button>

      <AnimatePresence>
        {modalBloqueio && (
          <BloqueioModal
            nomeBarbeiro={dados.nome.split(" ")[0]}
            onClose={() => setModalBloqueio(false)}
            onConfirmar={adicionarBloqueio}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEquipe && <ModalEquipe onClose={() => setModalEquipe(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TeamSwitcher — header de navegação
   OWNER: vê e navega entre todos os slugs (abas fosca/âmbar)
   BARBER: vê apenas o próprio nome
══════════════════════════════════════════════════════════════════ */
function TeamSwitcher({ atual, isOwner }: { atual: string; isOwner: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="flex items-center justify-between w-full h-16 px-5 sm:px-6 bg-black/80 backdrop-blur-md border-b border-neutral-900 relative z-10">

      {/* Esquerda: logo + tabs */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#C9A84C0D] border border-[#C9A84C20]">
            <Scissors className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1E1E1E] hidden sm:block select-none">
            Inspire Barber
          </span>
        </div>

        <div className="w-px h-4 bg-[#1A1A1A]" />

        {/* OWNER: abas de troca de cadeira */}
        {isOwner ? (
          <div className="flex items-center gap-0.5 p-0.5 bg-[#0A0A0A] border border-[#141414] rounded-lg">
            {TODOS_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/admin/${slug}`}
                className={cn(
                  /* min-h-[44px] — zona de toque anatômica (WCAG 2.5.5) */
                  "min-h-[44px] flex items-center px-3 rounded-md font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-200",
                  slug === atual
                    ? "bg-[#C9A84C12] text-[#C9A84C] border border-[#C9A84C25]"
                    : "text-[#3A3A3A] hover:text-[#A8A49E] hover:bg-[#0F0F0F] border border-transparent"
                )}
              >
                {PRIMEIRO_NOME[slug] ?? slug}
              </Link>
            ))}
          </div>
        ) : (
          /* BARBER: só o próprio nome */
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]">
              {PRIMEIRO_NOME[atual] ?? atual}
            </span>
          </div>
        )}
      </div>

      {/* Direita: botão sair com transição suave */}
      <motion.button
        onClick={handleLogout}
        whileTap={{ scale: 0.97 }}
        className="group min-h-[44px] flex items-center gap-2 px-3 rounded-lg border border-transparent hover:border-[#1A1A1A] transition-all duration-200"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#2A2A2A] group-hover:text-[#6B6760] transition-colors duration-200">
          Sair
        </span>
        <LogOut className="w-3.5 h-3.5 text-[#2A2A2A] group-hover:text-amber-400 transition-colors duration-300" strokeWidth={1.5} />
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MetricCard — números grandes e expressivos
══════════════════════════════════════════════════════════════════ */
function MetricCard({
  icon, label, value, sub, dourado = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; dourado?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden bg-[#0D0D0D] border p-3 sm:p-4 flex flex-col gap-1.5",
        dourado ? "border-[#C9A84C20]" : "border-[#141414]"
      )}
    >
      {/* Fio dourado no topo para o card de faturamento */}
      {dourado && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C35] to-transparent" />
      )}

      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#2A2A2A] truncate">
          {label}
        </span>
      </div>

      <p className={cn(
        "font-display font-semibold leading-none tabular-nums break-all",
        dourado
          ? "text-[#C9A84C] text-lg sm:text-xl"
          : "text-[#F0EDE8] text-2xl sm:text-3xl"
      )}>
        {value}
      </p>

      <p className="font-mono text-[9px] text-[#2A2A2A] tracking-wide">{sub}</p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AgendaTimeline — linha do tempo vertical minimalista
══════════════════════════════════════════════════════════════════ */
function AgendaTimeline({
  agendamentos, onMudarStatus,
}: {
  agendamentos: Agendamento[];
  onMudarStatus: (id: string, s: Status) => void;
}) {
  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-[52px] top-6 bottom-6 w-px bg-gradient-to-b from-[#C9A84C20] via-[#1A1A1A] to-transparent pointer-events-none" />
      <div className="space-y-3">
        {agendamentos.map((ag, i) => (
          <motion.div
            key={ag.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.28, ease: "easeOut" }}
          >
            <AgendamentoCard ag={ag} onMudarStatus={onMudarStatus} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Bloco de agendamento individual ────────────────────────────── */
function AgendamentoCard({
  ag, onMudarStatus,
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
      {/* Coluna de horário + ponto da timeline */}
      <div className="w-[52px] shrink-0 flex flex-col items-center pt-3.5 gap-2">
        <span className={cn(
          "font-mono text-sm font-bold tabular-nums leading-none",
          bloqueado ? "text-[#1E1E1E]" : "text-[#C9A84C]"
        )}>
          {ag.horario}
        </span>
        <div className={cn(
          "w-2 h-2 rounded-full z-10",
          ag.status === "concluido"  ? "bg-emerald-400"  :
          ag.status === "confirmado" ? "bg-[#C9A84C]"    :
                                       "bg-[#141414] border border-[#1E1E1E]"
        )} />
      </div>

      {/* Card flutuante */}
      <div className={cn(
        "flex-1 rounded-xl border overflow-hidden",
        bloqueado
          ? "border-[#0F0F0F] bg-[#0A0A0A] opacity-30"
          : cn(
              "bg-[#0D0D0D] hover:border-[#1E1E1E] transition-colors duration-200",
              ag.status === "concluido"
                ? "border-emerald-900/20"
                : "border-[#141414]"
            )
      )}>
        <button
          className="w-full text-left p-3.5"
          onClick={() => !bloqueado && setExpandido((v) => !v)}
          disabled={bloqueado}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Badge de status — arredondado */}
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 mb-2",
                "rounded-full text-[9px] font-semibold tracking-[0.15em] uppercase border",
                cls
              )}>
                {label}
              </span>

              {/* Nome do cliente em fonte serifada */}
              <p className={cn(
                "font-display font-semibold leading-tight truncate",
                bloqueado ? "text-[#1E1E1E] text-sm" : "text-[#F0EDE8] text-sm sm:text-base"
              )}>
                {bloqueado ? "Horário bloqueado" : ag.cliente}
              </p>

              {/* Serviço em mono */}
              <p className="font-mono text-[10px] text-[#3A3A3A] mt-1 truncate tracking-wide">
                {ag.servico}
              </p>
            </div>

            {!bloqueado && (
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <span className="font-display text-sm font-semibold text-[#C9A84C] tabular-nums">
                  {formatarPreco(ag.preco)}
                </span>
                <motion.div animate={{ rotate: expandido ? 90 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#2A2A2A]" strokeWidth={1.5} />
                </motion.div>
              </div>
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expandido && !bloqueado && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-[#0F0F0F] px-3.5 pt-3 pb-3.5 space-y-3">

                {ag.tags.length > 0 && (
                  <div>
                    <p className="font-mono text-[8px] font-bold tracking-[0.3em] uppercase text-[#1E1E1E] mb-2">
                      Preferências
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ag.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-[10px] text-[#C9A84C60] border border-[#C9A84C15] bg-[#C9A84C06]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {waUrl && (
                    <a
                      href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 active:scale-95 transition-all duration-150"
                    >
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      WhatsApp
                    </a>
                  )}
                  {ag.status === "confirmado" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onMudarStatus(ag.id, "concluido")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-[#C9A84C] border border-[#C9A84C25] bg-[#C9A84C06] hover:bg-[#C9A84C10] transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      Concluir
                    </motion.button>
                  )}
                  {ag.status === "concluido" && (
                    <button
                      onClick={() => onMudarStatus(ag.id, "confirmado")}
                      className="text-[10px] text-[#2A2A2A] hover:text-[#6B6760] transition-colors px-2 py-1 rounded"
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
   ModalEquipe — gerenciamento de equipe (owner only)
══════════════════════════════════════════════════════════════════ */
function ModalEquipe({ onClose }: { onClose: () => void }) {
  const [view,            setView]            = useState<ViewEquipe>("lista");
  const [profissionais,   setProfissionais]   = useState<ProfDB[]>([]);
  const [loadingLista,    setLoadingLista]    = useState(true);
  const [profSelecionado, setProfSelecionado] = useState<ProfDB | null>(null);
  const [deletandoId,     setDeletandoId]     = useState<string | null>(null);
  const [deletandoLoad,   setDeletandoLoad]   = useState(false);
  const [toggleLoadId,    setToggleLoadId]    = useState<string | null>(null);

  const [form,         setForm]         = useState<FormEquipe>(FORM_VAZIO);
  const [arquivo,      setArquivo]      = useState<File | null>(null);
  const [preview,      setPreview]      = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [sucesso,      setSucesso]      = useState(false);
  const [erro,         setErro]         = useState("");

  const fetchProfissionais = async () => {
    setLoadingLista(true);
    try {
      const res  = await fetch("/api/admin/profissionais");
      const json = await res.json() as { profissionais?: ProfDB[]; error?: string };
      setProfissionais(json.profissionais ?? []);
    } catch {
      /* lista fica vazia — usuário pode fechar e reabrir */
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => { fetchProfissionais(); }, []);

  const toggleRole = async (prof: ProfDB) => {
    setToggleLoadId(prof.id);
    try {
      const res  = await fetch(`/api/admin/profissionais/${prof.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleRole", currentRole: prof.role }),
      });
      const json = await res.json() as { ok?: boolean; role?: "OWNER" | "BARBER"; error?: string };
      if (res.ok && json.role) {
        setProfissionais((prev) =>
          prev.map((p) => p.id === prof.id ? { ...p, role: json.role! } : p)
        );
      }
    } catch (err) {
      console.error("[toggleRole] Erro de rede:", err);
    } finally {
      setToggleLoadId(null);
    }
  };

  const abrirEdicao = (prof: ProfDB) => {
    setProfSelecionado(prof);
    setForm({
      nome: prof.nome, especialidade: prof.especialidade ?? "",
      slug: prof.slug, whatsapp: prof.whatsapp ?? "",
      email: prof.email ?? "", senha: "",
    });
    setArquivo(null);
    setPreview(prof.foto_url ?? null);
    setSucesso(false); setErro(""); setMostrarSenha(false);
    setView("edicao");
  };

  const abrirCadastro = () => {
    setProfSelecionado(null);
    setForm(FORM_VAZIO);
    setArquivo(null); setPreview(null);
    setSucesso(false); setErro(""); setMostrarSenha(false);
    setView("cadastro");
  };

  const voltarLista = () => {
    setView("lista");
    setProfSelecionado(null);
    setErro(""); setSucesso(false);
  };

  const confirmarExclusao = async () => {
    if (!deletandoId) return;
    setDeletandoLoad(true);
    try {
      const res = await fetch(`/api/admin/profissionais/${deletandoId}`, { method: "DELETE" });
      if (res.ok) {
        setProfissionais((prev) => prev.filter((p) => p.id !== deletandoId));
      } else {
        const json = await res.json() as { error?: string };
        console.error("[confirmarExclusao]", json.error);
      }
    } catch (err) {
      console.error("[confirmarExclusao] Erro de rede:", err);
    } finally {
      setDeletandoId(null);
      setDeletandoLoad(false);
    }
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.slug || !form.email) {
      setErro("Nome, Slug e E-mail são obrigatórios."); return;
    }
    if (view === "cadastro" && !form.senha) {
      setErro("Senha é obrigatória para novo profissional."); return;
    }
    setErro(""); setLoading(true);

    try {
      let fotoUrl: string | null | undefined = undefined;
      if (arquivo) {
        const ext      = arquivo.name.split(".").pop();
        const filename = `${Date.now()}-${form.slug.toLowerCase()}.${ext}`;
        const { error: uploadErr } = await getSupabaseClient().storage
          .from("barbeiros-fotos")
          .upload(filename, arquivo, { upsert: true, contentType: arquivo.type });
        if (uploadErr) { setErro(`Erro no upload: ${uploadErr.message}`); return; }
        const { data: urlData } = getSupabaseClient().storage.from("barbeiros-fotos").getPublicUrl(filename);
        fotoUrl = urlData.publicUrl;
      }

      if (view === "cadastro") {
        const res  = await fetch("/api/admin/profissionais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome:          form.nome.trim(),
            especialidade: form.especialidade.trim() || null,
            slug:          form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
            whatsapp:      form.whatsapp.replace(/\D/g, "") || null,
            email:         form.email.toLowerCase().trim(),
            password:      form.senha,
            foto_url:      fotoUrl ?? null,
          }),
        });
        const json = await res.json() as { error?: string };
        if (!res.ok) { setErro(json.error ?? "Erro ao criar profissional."); return; }
        setSucesso(true);
        await fetchProfissionais();
        setTimeout(() => { voltarLista(); setSucesso(false); }, 1600);

      } else if (view === "edicao" && profSelecionado) {
        const payload: Record<string, unknown> = {
          action:        "update",
          nome:          form.nome.trim(),
          especialidade: form.especialidade.trim() || null,
          slug:          form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
          whatsapp:      form.whatsapp.replace(/\D/g, "") || null,
          email:         form.email.toLowerCase().trim(),
        };
        if (form.senha)            payload.password = form.senha;
        if (fotoUrl !== undefined) payload.foto_url = fotoUrl;

        const res  = await fetch(`/api/admin/profissionais/${profSelecionado.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json() as { error?: string };
        if (!res.ok) { setErro(json.error ?? "Erro ao atualizar profissional."); return; }

        setProfissionais((prev) =>
          prev.map((p) => p.id === profSelecionado.id
            ? {
                ...p,
                nome:          form.nome.trim(),
                especialidade: form.especialidade.trim() || null,
                slug:          form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
                whatsapp:      form.whatsapp.replace(/\D/g, "") || null,
                email:         form.email.toLowerCase().trim(),
                foto_url:      fotoUrl !== undefined ? fotoUrl : p.foto_url,
              }
            : p
          )
        );
        setSucesso(true);
        setTimeout(() => { voltarLista(); setSucesso(false); }, 1200);
      }
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: keyof FormEquipe) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArquivo(file);
    setPreview(file ? URL.createObjectURL(file) : (profSelecionado?.foto_url ?? null));
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        key="overlay-equipe"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal — rounded-2xl */}
      <motion.div
        key="modal-equipe"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "fixed inset-x-3 top-[3vh] bottom-[3vh] z-50",
          "sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2",
          "sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto",
          "sm:w-full sm:max-w-2xl",
          "bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden",
          "flex flex-col shadow-[0_40px_80px_0_#00000090]"
        )}
      >
        {/* Fio dourado */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C40] to-transparent shrink-0" />

        <AnimatePresence mode="wait" initial={false}>

          {/* ── VIEW: Lista ───────────────────────────────────── */}
          {view === "lista" && (
            <motion.div
              key="view-lista"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-4 border-b border-[#0F0F0F] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#C9A84C0D] border border-[#C9A84C20]">
                    <Users className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F0EDE8] leading-tight">
                      Gerenciamento da Equipe
                    </h2>
                    <p className="font-mono text-[9px] text-[#3A3A3A] tracking-[0.25em] uppercase mt-0.5">
                      Inspire Barber Studio
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.button
                    onClick={abrirCadastro}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg",
                      "border border-[#C9A84C30] text-[#C9A84C]",
                      "font-mono text-[9px] font-semibold tracking-[0.15em] uppercase",
                      "hover:bg-[#C9A84C08] hover:border-[#C9A84C60]",
                      "transition-all duration-200"
                    )}
                  >
                    <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                    Novo
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-full text-[#3A3A3A] hover:text-[#F0EDE8] hover:bg-[#1A1A1A] transition-all duration-150"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </div>
              </div>

              {/* Lista de profissionais */}
              <div className="overflow-y-auto flex-1 overscroll-contain">
                {loadingLista ? (
                  <div className="flex items-center justify-center py-14">
                    <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin" strokeWidth={1.5} />
                  </div>
                ) : profissionais.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-2">
                    <Users className="w-5 h-5 text-[#1E1E1E]" strokeWidth={1.5} />
                    <p className="font-mono text-[10px] text-[#2A2A2A] tracking-[0.25em] uppercase">
                      Nenhum profissional cadastrado
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#0F0F0F]">
                    {profissionais.map((prof) => (
                      <div key={prof.id}>
                        <div className="flex items-center gap-4 px-5 sm:px-7 py-4">
                          {/* Avatar perfeitamente redondo */}
                          <div className="w-11 h-11 shrink-0 overflow-hidden rounded-full border border-[#2A2A2A] bg-[#141414] flex items-center justify-center">
                            {prof.foto_url ? (
                              <Image
                                src={prof.foto_url}
                                alt={prof.nome}
                                width={44} height={44}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-display text-sm font-semibold text-[#4A4A4A]">
                                {prof.nome.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-base font-semibold text-[#F0EDE8] truncate leading-tight">
                              {prof.nome}
                            </p>
                            <span className={cn(
                              "inline-block mt-1 px-2.5 py-0.5 rounded-full",
                              "font-mono text-[9px] font-bold tracking-[0.18em] uppercase border",
                              prof.role === "OWNER"
                                ? "text-[#C9A84C] border-[#C9A84C30] bg-[#C9A84C08]"
                                : "text-[#3A3A3A] border-[#1E1E1E]"
                            )}>
                              {prof.role === "OWNER" ? "Owner" : "Barber"}
                            </span>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleRole(prof)}
                              disabled={toggleLoadId === prof.id}
                              title={prof.role === "OWNER" ? "Rebaixar para Barber" : "Promover a Owner"}
                              className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-200",
                                prof.role === "OWNER"
                                  ? "text-[#C9A84C] hover:bg-[#C9A84C10]"
                                  : "text-[#2A2A2A] hover:text-[#C9A84C] hover:bg-[#0F0F0F]"
                              )}
                            >
                              {toggleLoadId === prof.id
                                ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                : <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                              }
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => abrirEdicao(prof)}
                              title="Editar"
                              className="w-11 h-11 flex items-center justify-center rounded-lg text-[#2A2A2A] hover:text-[#F0EDE8] hover:bg-[#0F0F0F] transition-all duration-200"
                            >
                              <Pencil className="w-4 h-4" strokeWidth={1.5} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeletandoId(deletandoId === prof.id ? null : prof.id)}
                              title="Excluir"
                              className="w-11 h-11 flex items-center justify-center rounded-lg text-[#2A2A2A] hover:text-red-500 hover:bg-red-950/20 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Confirmação de exclusão inline */}
                        <AnimatePresence>
                          {deletandoId === prof.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="mx-5 sm:mx-7 mb-3 p-4 rounded-xl border border-red-900/30 bg-red-950/10">
                                <p className="text-sm text-[#F0EDE8] mb-3 leading-relaxed">
                                  Tem certeza que deseja remover{" "}
                                  <span className="text-[#C9A84C] font-semibold">{prof.nome}</span>{" "}
                                  da equipe? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-2">
                                  <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={confirmarExclusao}
                                    disabled={deletandoLoad}
                                    className={cn(
                                      "flex items-center gap-2 px-4 py-2.5 rounded-lg",
                                      "font-mono text-[10px] font-semibold tracking-[0.1em] uppercase",
                                      "bg-red-700 text-white hover:bg-red-600 transition-colors",
                                      deletandoLoad && "opacity-60 cursor-not-allowed"
                                    )}
                                  >
                                    {deletandoLoad
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                                      : <Trash2  className="w-3.5 h-3.5" strokeWidth={2} />
                                    }
                                    Remover
                                  </motion.button>
                                  <button
                                    onClick={() => setDeletandoId(null)}
                                    className="px-4 py-2.5 rounded-lg font-mono text-[10px] font-semibold tracking-[0.1em] uppercase text-[#4A4A4A] hover:text-[#A8A49E] transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé */}
              <div className="px-5 sm:px-7 py-3.5 border-t border-[#0F0F0F] shrink-0">
                <p className="font-mono text-[9px] text-[#2A2A2A] text-center tracking-wider">
                  {profissionais.length} profissional{profissionais.length !== 1 ? "is" : ""} · Inspire Barber Studio
                </p>
              </div>
            </motion.div>
          )}

          {/* ── VIEW: Cadastro / Edição ──────────────────────── */}
          {(view === "cadastro" || view === "edicao") && (
            <motion.div
              key="view-form"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header do formulário */}
              <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-4 border-b border-[#0F0F0F] shrink-0">
                <div className="flex items-center gap-2.5">
                  <motion.button
                    onClick={voltarLista}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-lg text-[#4A4A4A] hover:text-[#F0EDE8] hover:bg-[#141414] transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F0EDE8] leading-tight">
                      {view === "cadastro" ? "Novo Profissional" : "Editar Profissional"}
                    </h2>
                    <p className="font-mono text-[9px] text-[#3A3A3A] tracking-[0.25em] uppercase mt-0.5">
                      {view === "edicao" && profSelecionado ? profSelecionado.nome : "Inspire Barber · Equipe"}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-[#3A3A3A] hover:text-[#F0EDE8] hover:bg-[#1A1A1A] transition-all duration-150"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Corpo do formulário */}
              <div className="overflow-y-auto flex-1 overscroll-contain px-5 sm:px-7 py-5 space-y-5">

                {/* Foto — avatar redondo no preview */}
                <div>
                  <label className={LABEL_CLS}>Foto do Profissional</label>
                  <label className="flex items-center gap-4 p-4 rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] cursor-pointer hover:border-[#C9A84C25] transition-all duration-200 group">
                    <div className="w-14 h-14 shrink-0 overflow-hidden rounded-full border-2 border-[#2A2A2A] flex items-center justify-center bg-[#141414] group-hover:border-[#C9A84C30] transition-colors duration-200">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#2A2A2A]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#4A4A4A] group-hover:text-[#A8A49E] transition-colors truncate">
                        {arquivo ? arquivo.name : "Selecionar imagem…"}
                      </p>
                      <p className="font-mono text-[9px] text-[#2A2A2A] mt-1">JPG, PNG, WEBP</p>
                    </div>
                    <Upload className="w-4 h-4 text-[#2A2A2A] group-hover:text-[#C9A84C] transition-colors shrink-0" strokeWidth={1.5} />
                    <input type="file" accept="image/*" onChange={handleArquivo} className="sr-only" />
                  </label>
                </div>

                <div>
                  <label className={LABEL_CLS}>Nome *</label>
                  <input value={form.nome} onChange={setField("nome")} placeholder="Ex: Mateus Silva" className={INPUT_CLS} />
                </div>

                <div>
                  <label className={LABEL_CLS}>Especialidade</label>
                  <input value={form.especialidade} onChange={setField("especialidade")} placeholder="Ex: Barba · Degradê" className={INPUT_CLS} />
                </div>

                <div>
                  <label className={LABEL_CLS}>Slug da URL *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    placeholder="ex: mateus → /admin/mateus"
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLS}>WhatsApp</label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm((p) => ({ ...p, whatsapp: mascaraTelefone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLS}>E-mail *</label>
                  <input type="email" value={form.email} onChange={setField("email")} placeholder="profissional@email.com" className={INPUT_CLS} />
                </div>

                <div>
                  <label className={LABEL_CLS}>
                    {view === "edicao" ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={setField("senha")}
                      placeholder="••••••••"
                      className={INPUT_CLS}
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMostrarSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-[#3A3A3A] hover:text-[#A8A49E] hover:bg-[#141414] transition-all duration-150"
                    >
                      {mostrarSenha
                        ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                        : <Eye    className="w-4 h-4" strokeWidth={1.5} />
                      }
                    </motion.button>
                  </div>
                </div>

                {view === "cadastro" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-[#0D0D0D] border border-[#141414]">
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#3A3A3A]">Role inicial</span>
                    <span className="ml-auto font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#C9A84C] border border-[#C9A84C30] bg-[#C9A84C08] px-2 py-1 rounded-full">
                      BARBER
                    </span>
                  </div>
                )}

                <AnimatePresence>
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/15 border border-red-900/25"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="font-mono text-[10px] text-red-400">{erro}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {sucesso && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-950/15 border border-emerald-900/25"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                      <span className="font-mono text-[10px] text-emerald-400">
                        {view === "cadastro" ? "Profissional cadastrado!" : "Dados atualizados!"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleSalvar}
                  disabled={loading || sucesso}
                  whileTap={!loading && !sucesso ? { scale: 0.98 } : {}}
                  className={cn(
                    "w-full flex items-center justify-center gap-2.5 h-14 mt-2 rounded-xl",
                    "font-mono text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200",
                    loading || sucesso
                      ? "bg-[#141414] text-[#2A2A2A] cursor-not-allowed border border-[#1A1A1A]"
                      : "bg-amber-500 text-[#0B0B0B] hover:bg-amber-400 hover:shadow-[0_0_24px_0_#C9A84C35] active:scale-[0.98]"
                  )}
                >
                  {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />Salvando...</>
                    : <><Check className="w-3.5 h-3.5" strokeWidth={2.5} />{view === "cadastro" ? "Cadastrar Profissional" : "Salvar Alterações"}</>
                  }
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BloqueioModal — bottom sheet para bloqueio de horário
══════════════════════════════════════════════════════════════════ */
function BloqueioModal({
  nomeBarbeiro, onClose, onConfirmar,
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
    onConfirmar(inicio, `${dLabel} · ${inicio}–${fim}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-[#1A1A1A] rounded-t-2xl max-w-2xl mx-auto"
      >
        <div className="w-8 h-1 bg-[#1E1E1E] rounded-full mx-auto mt-4 mb-5" />
        {/* pb considera o home indicator do iPhone via env(safe-area-inset-bottom) */}
        <div className="px-5 pb-[calc(40px+env(safe-area-inset-bottom))] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#4A4A4A]" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold text-[#F0EDE8]">Bloquear Horário</h3>
              </div>
              <p className="font-mono text-[10px] text-[#3A3A3A] mt-0.5 tracking-wide">Agenda de {nomeBarbeiro}</p>
            </div>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 flex items-center justify-center rounded-full text-[#3A3A3A] hover:text-[#A8A49E] hover:bg-[#141414] transition-all duration-150"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>

          <div>
            <label className="block font-mono text-[9px] font-semibold tracking-[0.25em] uppercase text-[#4A4A4A] mb-2">
              Data
            </label>
            <input
              type="date" min={hoje} value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Das", value: inicio, set: setInicio },
              { label: "Até", value: fim,    set: setFim    },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block font-mono text-[9px] font-semibold tracking-[0.25em] uppercase text-[#4A4A4A] mb-2">
                  {label}
                </label>
                <input
                  type="time" value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
                />
              </div>
            ))}
          </div>

          <motion.button
            onClick={confirmar}
            disabled={!data}
            whileTap={data ? { scale: 0.98 } : {}}
            className={cn(
              "w-full h-14 rounded-xl font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300",
              data
                ? "text-[#0B0B0B] bg-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                : "text-[#2A2A2A] bg-[#141414] cursor-not-allowed border border-[#1A1A1A]"
            )}
          >
            Confirmar Bloqueio
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Profissional não encontrado
══════════════════════════════════════════════════════════════════ */
function ProfissionalNaoEncontrado({ slug }: { slug: string }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-sm"
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#141414] border border-[#1E1E1E] mx-auto mb-6">
          <AlertTriangle className="w-6 h-6 text-[#3A3A3A]" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#F0EDE8] mb-2">
          Profissional não encontrado
        </h1>
        <p className="text-[#4A4A4A] text-sm leading-relaxed mb-1">
          Nenhum profissional com o slug{" "}
          <code className="text-[#C9A84C] bg-[#C9A84C0D] px-1.5 py-0.5 rounded font-mono text-[11px]">{slug}</code>.
        </p>
        <p className="font-mono text-[10px] text-[#2A2A2A] mb-8">
          Slugs disponíveis:{" "}
          {TODOS_SLUGS.map((s) => (
            <Link key={s} href={`/admin/${s}`} className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors">
              /admin/{s}{" "}
            </Link>
          ))}
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-[#0B0B0B] font-mono text-sm font-bold tracking-[0.15em] uppercase hover:bg-amber-400 transition-all duration-300"
        >
          <Scissors className="w-4 h-4" strokeWidth={2} />
          Ir para Login
        </Link>
      </motion.div>
    </div>
  );
}
