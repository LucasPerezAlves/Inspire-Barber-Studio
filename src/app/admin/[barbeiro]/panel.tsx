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
import { supabase, type AgendamentoDB } from "@/lib/supabase";
import { mascaraTelefone } from "@/data/agendamento-dados";

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

/* ── Gerenciamento de equipe ─────────────────────────────────────── */
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
  nome: string; especialidade: string; slug: string; whatsapp: string; email: string; senha: string;
}

/* ── Slugs válidos ───────────────────────────────────────────────── */
const TODOS_SLUGS = ["pablo", "altamiro"] as const;
const PRIMEIRO_NOME: Record<string, string> = { pablo: "Pablo", altamiro: "Altamiro" };

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
  confirmado: { label: "Confirmado", cls: "text-[#C9A84C] border-[#C9A84C40] bg-[#C9A84C08]" },
  concluido:  { label: "Concluído",  cls: "text-[#4ADE80] border-[#4ADE8030] bg-[#4ADE8008]" },
  bloqueado:  { label: "Bloqueado",  cls: "text-[#6B6760] border-[#2A2A2A] bg-[#1A1A1A]"    },
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

/* ══════════════════════════════════════════════════════════════════
   Componente principal exportado
══════════════════════════════════════════════════════════════════ */
export function AdminPanel({ slug }: { slug: string }) {
  const key = slug.toLowerCase();
  const [dados,      setDados]      = useState<BarbeiroData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchSupabase() {
      try {
        const { data: prof, error: errProf } = await supabase
          .from("profissionais")
          .select("id, nome, slug, especialidade")
          .eq("slug", key)
          .single();

        if (errProf) {
          console.error("[AdminPanel] Erro ao buscar profissional:", errProf.message);
          return;
        }
        if (!prof) return;

        const hoje      = new Date();
        const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
        const fimDia    = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString();

        const { data: ags, error: errAgs } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("profissional_id", prof.id)
          .gte("data_hora", inicioDia)
          .lte("data_hora", fimDia)
          .order("data_hora", { ascending: true });

        if (errAgs) console.error("[AdminPanel] Erro ao buscar agendamentos:", errAgs.message);

        setDados({
          slug:          prof.slug,
          nome:          prof.nome,
          especialidade: prof.especialidade ?? "Inspire Barber Studio",
          agendamentos:  (ags ?? []).map(mapAgendamento),
        });
      } catch (err) {
        console.error("[AdminPanel] Erro inesperado:", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchSupabase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (carregando) return <PainelSkeleton />;
  if (!dados)     return <ProfissionalNaoEncontrado slug={slug} />;
  return <Dashboard dados={dados} />;
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function PainelSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" strokeWidth={1.5} />
        <p className="text-[11px] text-[#6B6760] tracking-widest uppercase">Carregando painel…</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard interativo
══════════════════════════════════════════════════════════════════ */
function Dashboard({ dados }: { dados: BarbeiroData }) {
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
      servico: `Bloqueado • ${descricao}`, duracao: 60, preco: 0, status: "bloqueado", tags: [],
    };
    setAgendamentos((prev) => [...prev, novo].sort((a, b) => a.horario.localeCompare(b.horario)));
    setModalBloqueio(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,#C9A84C05_0%,transparent_65%)] pointer-events-none" />

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
                <span className="text-gradient-gold">{dados.nome.split(" ")[0]}</span>
              </h1>
              <p className="text-[11px] text-[#6B6760] mt-0.5">{dados.especialidade}</p>
            </div>
            <p className="text-[11px] text-[#6B6760] text-right capitalize shrink-0 leading-tight">
              {todayLabel()}
            </p>
          </div>

          {/* Botão exclusivo do dono */}
          {dados.slug === "pablo" && (
            <div className="mt-4">
              <motion.button
                onClick={() => setModalEquipe(true)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2",
                  "border border-[#C9A84C40] text-[#C9A84C]",
                  "text-[11px] font-semibold tracking-[0.15em] uppercase",
                  "hover:bg-[#C9A84C10] hover:border-[#C9A84C80]",
                  "transition-all duration-200"
                )}
              >
                <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                Gerenciar Equipe 👥
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Métricas ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <MetricCard
            icon={<CalendarDays className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Hoje" value={String(ativos.length)} sub="horários"
          />
          <MetricCard
            icon={<TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Estimado" value={formatarPreco(faturamento)} sub="faturamento" dourado
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
            label="Cadeira" value={`${hh}h${mm > 0 ? ` ${mm}m` : ""}`} sub="tempo total"
          />
        </div>

        {/* ── Separador ───────────────────────────────────────── */}
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
        {agendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Scissors className="w-6 h-6 text-[#2A2A2A]" strokeWidth={1.5} />
            <p className="text-[11px] text-[#3A3A3A] tracking-widest uppercase">
              Nenhum agendamento para hoje
            </p>
          </div>
        ) : (
          <AgendaTimeline agendamentos={agendamentos} onMudarStatus={mudarStatus} />
        )}
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
   ModalEquipe — gerenciamento centralizado (owner only)
══════════════════════════════════════════════════════════════════ */
const FORM_VAZIO: FormEquipe = {
  nome: "", especialidade: "", slug: "", whatsapp: "", email: "", senha: "",
};
const INPUT_CLS = cn(
  "w-full bg-[#0D0D0D] px-4 h-12 sm:h-14 text-base text-[#F0EDE8]",
  "placeholder:text-[#2A2A2A] border border-[#2A2A2A]",
  "focus:border-[#C9A84C] focus:outline-none transition-colors duration-200"
);
const LABEL_CLS = "block text-[9px] font-semibold tracking-[0.25em] uppercase text-[#6B6760] mb-2";

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
    const { data } = await supabase
      .from("profissionais")
      .select("id, nome, slug, especialidade, whatsapp, email, role, foto_url")
      .order("nome", { ascending: true });
    setProfissionais(data ?? []);
    setLoadingLista(false);
  };

  useEffect(() => { fetchProfissionais(); }, []);

  const toggleRole = async (prof: ProfDB) => {
    setToggleLoadId(prof.id);
    const newRole: "OWNER" | "BARBER" = prof.role === "OWNER" ? "BARBER" : "OWNER";
    const { error } = await supabase.from("profissionais").update({ role: newRole }).eq("id", prof.id);
    if (!error) {
      setProfissionais((prev) => prev.map((p) => p.id === prof.id ? { ...p, role: newRole } : p));
    }
    setToggleLoadId(null);
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
    await supabase.from("agendamentos").update({ profissional_id: null }).eq("profissional_id", deletandoId);
    await supabase.from("profissionais").delete().eq("id", deletandoId);
    setProfissionais((prev) => prev.filter((p) => p.id !== deletandoId));
    setDeletandoId(null);
    setDeletandoLoad(false);
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
        const { error: uploadErr } = await supabase.storage
          .from("barbeiros-fotos")
          .upload(filename, arquivo, { upsert: true, contentType: arquivo.type });
        if (uploadErr) { setErro(`Erro no upload: ${uploadErr.message}`); return; }
        const { data: urlData } = supabase.storage.from("barbeiros-fotos").getPublicUrl(filename);
        fotoUrl = urlData.publicUrl;
      }

      if (view === "cadastro") {
        const { error } = await supabase.from("profissionais").insert({
          nome:          form.nome.trim(),
          especialidade: form.especialidade.trim() || null,
          slug:          form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
          whatsapp:      form.whatsapp.replace(/\D/g, "") || null,
          email:         form.email.toLowerCase().trim(),
          password:      form.senha,
          role:          "BARBER",
          foto_url:      fotoUrl ?? null,
        });
        if (error) { setErro(error.message); return; }
        setSucesso(true);
        await fetchProfissionais();
        setTimeout(() => { voltarLista(); setSucesso(false); }, 1600);

      } else if (view === "edicao" && profSelecionado) {
        const payload: Record<string, unknown> = {
          nome:          form.nome.trim(),
          especialidade: form.especialidade.trim() || null,
          slug:          form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
          whatsapp:      form.whatsapp.replace(/\D/g, "") || null,
          email:         form.email.toLowerCase().trim(),
        };
        if (form.senha) payload.password = form.senha;
        if (fotoUrl !== undefined) payload.foto_url = fotoUrl;

        const { error } = await supabase.from("profissionais").update(payload).eq("id", profSelecionado.id);
        if (error) { setErro(error.message); return; }

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
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArquivo(file);
    setPreview(file ? URL.createObjectURL(file) : (profSelecionado?.foto_url ?? null));
  };

  return (
    <>
      <motion.div
        key="overlay-equipe"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
      />

      <motion.div
        key="modal-equipe"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="fixed inset-x-2 top-[3vh] bottom-[3vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:w-full sm:max-w-2xl z-50 bg-[#121212] border border-[#1E1E1E] overflow-hidden flex flex-col"
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <AnimatePresence mode="wait" initial={false}>

          {/* ── VIEW: Lista ───────────────────────────────────── */}
          {view === "lista" && (
            <motion.div
              key="view-lista"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-8 pt-5 pb-5 border-b border-[#1A1A1A] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 bg-[#C9A84C10] border border-[#C9A84C30]">
                    <Users className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F0EDE8] leading-tight">
                      Gerenciamento da Equipe
                    </h2>
                    <p className="text-[10px] text-[#6B6760] tracking-wider uppercase mt-0.5">
                      Inspire Barber Studio
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={abrirCadastro}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2",
                      "border border-[#C9A84C40] text-[#C9A84C]",
                      "text-[10px] font-semibold tracking-[0.15em] uppercase",
                      "hover:bg-[#C9A84C10] transition-all duration-200"
                    )}
                  >
                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                    Novo
                  </button>
                  <button onClick={onClose} className="p-2 text-[#6B6760] hover:text-[#F0EDE8] transition-colors ml-1">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto flex-1 overscroll-contain">
                {loadingLista ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin" strokeWidth={1.5} />
                  </div>
                ) : profissionais.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Users className="w-5 h-5 text-[#2A2A2A]" strokeWidth={1.5} />
                    <p className="text-[11px] text-[#3A3A3A] tracking-widest uppercase">
                      Nenhum profissional cadastrado
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1A1A1A]">
                    {profissionais.map((prof) => (
                      <div key={prof.id}>
                        <div className="flex items-center gap-4 px-5 sm:px-8 py-4">
                          {/* Avatar */}
                          <div className="w-11 h-11 shrink-0 overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A] flex items-center justify-center">
                            {prof.foto_url ? (
                              <Image
                                src={prof.foto_url}
                                alt={prof.nome}
                                width={44} height={44}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <span className="text-sm font-bold text-[#6B6760]">
                                {prof.nome.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-[#F0EDE8] truncate leading-tight">
                              {prof.nome}
                            </p>
                            <span className={cn(
                              "inline-block mt-1 px-2 py-0.5",
                              "text-[10px] font-bold tracking-[0.18em] uppercase border",
                              prof.role === "OWNER"
                                ? "text-[#C9A84C] border-[#C9A84C40] bg-[#C9A84C08]"
                                : "text-[#6B6760] border-[#2A2A2A]"
                            )}>
                              {prof.role === "OWNER" ? "Owner" : "Barber"}
                            </span>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleRole(prof)}
                              disabled={toggleLoadId === prof.id}
                              title={prof.role === "OWNER" ? "Rebaixar para Barber" : "Promover a Owner"}
                              className={cn(
                                "p-2.5 transition-colors duration-200",
                                prof.role === "OWNER"
                                  ? "text-[#C9A84C] hover:text-[#E6C97A]"
                                  : "text-[#3A3A3A] hover:text-[#C9A84C]"
                              )}
                            >
                              {toggleLoadId === prof.id
                                ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                                : <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                              }
                            </button>
                            <button
                              onClick={() => abrirEdicao(prof)}
                              title="Editar"
                              className="p-2.5 text-[#3A3A3A] hover:text-[#F0EDE8] transition-colors duration-200"
                            >
                              <Pencil className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => setDeletandoId(deletandoId === prof.id ? null : prof.id)}
                              title="Excluir"
                              className="p-2.5 text-[#3A3A3A] hover:text-red-500 transition-colors duration-200"
                            >
                              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                            </button>
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
                              <div className="mx-5 sm:mx-8 mb-3 p-4 border border-red-900/40 bg-red-950/20">
                                <p className="text-sm text-[#F0EDE8] mb-3 leading-relaxed">
                                  Tem certeza que deseja remover{" "}
                                  <span className="text-[#C9A84C] font-semibold">{prof.nome}</span>{" "}
                                  da equipe? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={confirmarExclusao}
                                    disabled={deletandoLoad}
                                    className={cn(
                                      "flex items-center gap-2 px-4 py-2.5",
                                      "text-[11px] font-semibold tracking-[0.1em] uppercase",
                                      "bg-red-700 text-white hover:bg-red-600 transition-colors",
                                      deletandoLoad && "opacity-60 cursor-not-allowed"
                                    )}
                                  >
                                    {deletandoLoad
                                      ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                      : <Trash2 className="w-4 h-4" strokeWidth={2} />
                                    }
                                    Remover
                                  </button>
                                  <button
                                    onClick={() => setDeletandoId(null)}
                                    className="px-4 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6B6760] hover:text-[#A8A49E] transition-colors"
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
              <div className="px-5 sm:px-8 py-4 border-t border-[#1A1A1A] shrink-0">
                <p className="text-[10px] text-[#2E2E2E] text-center tracking-wide">
                  {profissionais.length} profissional{profissionais.length !== 1 ? "is" : ""} · Inspire Barber Studio
                </p>
              </div>
            </motion.div>
          )}

          {/* ── VIEW: Cadastro / Edição ──────────────────────── */}
          {(view === "cadastro" || view === "edicao") && (
            <motion.div
              key="view-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header do form */}
              <div className="flex items-center justify-between px-5 sm:px-8 pt-5 pb-5 border-b border-[#1A1A1A] shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={voltarLista}
                    className="w-10 h-10 flex items-center justify-center text-[#6B6760] hover:text-[#F0EDE8] hover:bg-[#1A1A1A] transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F0EDE8] leading-tight">
                      {view === "cadastro" ? "Novo Profissional" : "Editar Profissional"}
                    </h2>
                    <p className="text-[10px] text-[#6B6760] tracking-wider uppercase mt-0.5">
                      {view === "edicao" && profSelecionado ? profSelecionado.nome : "Inspire Barber · Equipe"}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-[#6B6760] hover:text-[#F0EDE8] transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Corpo do form */}
              <div className="overflow-y-auto flex-1 overscroll-contain px-5 sm:px-8 py-5 space-y-5">

                {/* Foto */}
                <div>
                  <label className={LABEL_CLS}>Foto do Profissional</label>
                  <label className="relative flex items-center gap-4 p-4 border border-[#2A2A2A] bg-[#0D0D0D] cursor-pointer hover:border-[#C9A84C40] transition-colors group">
                    <div className="w-14 h-14 shrink-0 overflow-hidden border border-[#1A1A1A] flex items-center justify-center bg-[#1A1A1A]">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="preview" className="w-full h-full object-cover object-top" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#3A3A3A]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#6B6760] group-hover:text-[#A8A49E] transition-colors truncate">
                        {arquivo ? arquivo.name : "Selecionar imagem…"}
                      </p>
                      <p className="text-[10px] text-[#3A3A3A] mt-1">JPG, PNG, WEBP</p>
                    </div>
                    <Upload className="w-5 h-5 text-[#3A3A3A] group-hover:text-[#C9A84C] transition-colors shrink-0" strokeWidth={1.5} />
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
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6760] hover:text-[#A8A49E] transition-colors"
                    >
                      {mostrarSenha
                        ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                        : <Eye    className="w-4 h-4" strokeWidth={1.5} />
                      }
                    </button>
                  </div>
                </div>

                {view === "cadastro" && (
                  <div className="flex items-center gap-2 py-3 px-4 bg-[#0D0D0D] border border-[#1A1A1A]">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6B6760]">Role</span>
                    <span className="ml-auto text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A84C] border border-[#C9A84C40] px-2 py-1">
                      BARBER
                    </span>
                  </div>
                )}

                <AnimatePresence>
                  {erro && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-red-500 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                      {erro}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {sucesso && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 py-2"
                    >
                      <Check className="w-4 h-4 text-[#4ADE80]" strokeWidth={2.5} />
                      <span className="text-[11px] text-[#4ADE80]">
                        {view === "cadastro" ? "Profissional cadastrado!" : "Dados atualizados!"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSalvar}
                  disabled={loading || sucesso}
                  className={cn(
                    "w-full flex items-center justify-center gap-2.5 h-14 mt-2",
                    "text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200",
                    loading || sucesso
                      ? "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
                      : "bg-[#C9A84C] text-[#0B0B0B] hover:bg-[#E6C97A] active:scale-[0.98]"
                  )}
                >
                  {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />Salvando...</>
                    : <><Check className="w-3.5 h-3.5" strokeWidth={2.5} />{view === "cadastro" ? "Cadastrar Profissional" : "Salvar Alterações"}</>
                  }
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TeamSwitcher
══════════════════════════════════════════════════════════════════ */
function TeamSwitcher({ atual }: { atual: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between w-full h-16 px-6 bg-[#0B0B0B] border-b border-neutral-800 relative z-10">
      <div className="flex items-center gap-3">
        {TODOS_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200",
              slug === atual ? "text-[#0B0B0B] bg-[#C9A84C]" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {PRIMEIRO_NOME[slug] ?? slug}
          </Link>
        ))}
      </div>
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
  icon: React.ReactNode; label: string; value: string; sub: string; dourado?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("bg-[#121212] border p-3 flex flex-col gap-1", dourado ? "border-[#C9A84C20]" : "border-[#1E1E1E]")}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] text-[#6B6760] tracking-wider uppercase truncate">{label}</span>
      </div>
      <p className={cn("font-display font-semibold leading-tight break-all", dourado ? "text-[#C9A84C] text-[13px]" : "text-[#F0EDE8] text-lg")}>
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
  agendamentos, onMudarStatus,
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
      <div className="w-[76px] shrink-0 flex flex-col items-center gap-1.5 pt-3">
        <span className={cn("font-display text-sm font-semibold tabular-nums", bloqueado ? "text-[#2E2E2E]" : "text-[#C9A84C]")}>
          {ag.horario}
        </span>
        <div className={cn(
          "w-2.5 h-2.5 rounded-full border-2 z-10",
          ag.status === "concluido"  ? "bg-[#4ADE80] border-[#4ADE80]" :
          ag.status === "confirmado" ? "bg-[#C9A84C] border-[#C9A84C]" :
                                       "bg-[#1A1A1A] border-[#2A2A2A]"
        )} />
      </div>

      <div className={cn("flex-1 bg-[#121212] border overflow-hidden", bloqueado ? "border-[#161616] opacity-40" : "border-[#1E1E1E]")}>
        <button
          className="w-full text-left p-3"
          onClick={() => !bloqueado && setExpandido((v) => !v)}
          disabled={bloqueado}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className={cn("inline-flex items-center px-2 py-0.5 mb-1.5 text-[10px] font-semibold border", cls)}>
                {label}
              </span>
              <p className={cn("font-semibold text-sm leading-tight truncate", bloqueado ? "text-[#2E2E2E]" : "text-[#F0EDE8]")}>
                {bloqueado ? "Horário indisponível" : ag.cliente}
              </p>
              <p className="text-[11px] text-[#6B6760] mt-0.5 truncate">{ag.servico}</p>
            </div>
            {!bloqueado && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display text-sm font-semibold text-[#C9A84C]">{formatarPreco(ag.preco)}</span>
                <motion.div animate={{ rotate: expandido ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4 text-[#3A3A3A]" strokeWidth={1.5} />
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
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-[#1A1A1A] px-3 pt-3 pb-3 space-y-3">
                {ag.tags.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#2E2E2E] mb-1.5">
                      Preferências do Cliente
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ag.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 text-[10px] text-[#C9A84C70] border border-[#C9A84C18] bg-[#C9A84C06]">
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
    onConfirmar(inicio, `${dLabel} • ${inicio}–${fim}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2A2A2A] max-w-2xl mx-auto"
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-4 mb-5" />
        <div className="px-5 pb-10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#6B6760]" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold text-[#F0EDE8]">Bloquear Horário</h3>
              </div>
              <p className="text-[11px] text-[#6B6760] mt-0.5">Agenda de {nomeBarbeiro}</p>
            </div>
            <button onClick={onClose} className="text-[#6B6760] hover:text-[#A8A49E] transition-colors p-1">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2">Data</label>
            <input
              type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Das", value: inicio, set: setInicio },
              { label: "Até", value: fim,    set: setFim    },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2">{label}</label>
                <input
                  type="time" value={value} onChange={(e) => set(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C9A84C] px-4 py-3.5 text-[16px] sm:text-sm text-[#F0EDE8] outline-none [color-scheme:dark] transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={confirmar} disabled={!data}
            className={cn(
              "w-full py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300",
              data ? "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] active:scale-[0.98]"
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
          <code className="text-[#C9A84C] bg-[#C9A84C10] px-1.5 py-0.5 text-[11px]">{slug}</code>.
        </p>
        <p className="text-[#3A3A3A] text-xs mb-8">
          Slugs disponíveis:{" "}
          {TODOS_SLUGS.map((s) => (
            <Link key={s} href={`/admin/${s}`} className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors">
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
