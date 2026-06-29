"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, LogOut, User, Phone, Scissors, Star,
  Check, Sparkles, ChevronDown, Pencil, History, RotateCcw,
  Gift, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession, getSession } from "@/components/auth/auth-screen";

/* ── Tipos ──────────────────────────────────────────────────────── */
interface PerfilData {
  nome:              string;
  whatsapp:          string;
  cortes_fidelidade: number;
  proximo_gratis:    boolean;
  historico:         HistoricoItem[];
}

interface HistoricoItem {
  id:               string;
  profissional_nome: string | null;
  servicos:         string[];
  valor:            number;
  data_agendamento: string;
  horario:          string;
  criado_em:        string;
}

const FIDELIDADE_TOTAL = 10;
const PREMIO_NOME      = "Barba na Navalha";

/* ── Helpers ────────────────────────────────────────────────────── */
function formatPhone(d: string) {
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : d;
}

function getInitials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

/* ══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════ */
export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil]   = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Fonte de verdade: /api/cliente/perfil valida o JWT HttpOnly e
   * retorna dados frescos do Supabase. O middleware já redireciona para
   * /auth se não houver cookie, mas este fallback garante resiliência
   * em caso de race condition entre middleware e fetch.
   */
  useEffect(() => {
    fetch("/api/cliente/perfil", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (r.status === 401 || r.status === 404) {
          router.replace("/auth");
          return null;
        }
        return r.json() as Promise<PerfilData>;
      })
      .then((data) => {
        if (!data) return;
        setPerfil(data);
        /* Sincroniza o cache localStorage para Navbar/HeroSection */
        try {
          const { saveSession } = require("@/components/auth/auth-screen");
          saveSession({ nome: data.nome, whatsapp: data.whatsapp });
        } catch {}
      })
      .catch(() => router.replace("/auth"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try { await fetch("/api/cliente/logout", { method: "POST" }); } catch {}
    clearSession();
    router.push("/auth");
  };

  /* Reagendamento rápido: pré-seleciona serviços pelo nome */
  const handleRepetir = (servicos: string[]) => {
    sessionStorage.setItem("inspire_repeat_servicos_nome", JSON.stringify(servicos));
    router.push("/agendar");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!perfil) return null;

  const initials  = getInitials(perfil.nome);
  const firstName = perfil.nome.split(/\s+/)[0];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0B0B] px-4 py-12">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,#C9A84C05_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-md mx-auto space-y-3 z-10">

        {/* ── Boas-vindas ─────────────────────────────────────── */}
        <div className="text-center mb-6">
          <p className="text-[10px] text-[#6B6760] tracking-[0.35em] uppercase mb-1">Área do Cliente</p>
          <h1 className="font-display text-3xl font-light text-[#F0EDE8]">
            Olá,{" "}
            <span className="text-gradient-gold font-semibold">{firstName}</span>
          </h1>
        </div>

        {/* ── Card de perfil ──────────────────────────────────── */}
        <div className="bg-[#121212] border border-[#1E1E1E] overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-5 mb-6">
              <div className={cn(
                "w-16 h-16 shrink-0 flex items-center justify-center",
                "bg-[#C9A84C12] border border-[#C9A84C30]",
                "font-display text-2xl font-semibold text-[#C9A84C]"
              )}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-[#F0EDE8] leading-tight truncate">
                  {perfil.nome}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 text-[#C9A84C] fill-[#C9A84C]" />
                  <span className="text-[11px] text-[#6B6760] tracking-wider uppercase">
                    Cliente Inspire Barber
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-px border border-[#1A1A1A]">
              <InfoRow
                icon={<User className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />}
                label="Nome" value={perfil.nome}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />}
                label="WhatsApp" value={formatPhone(perfil.whatsapp)}
              />
            </div>
          </div>
        </div>

        {/* ── [1] Cartão Fidelidade ────────────────────────────── */}
        <CartaoFidelidade
          preenchidos={perfil.cortes_fidelidade}
          total={FIDELIDADE_TOTAL}
          premio={PREMIO_NOME}
          proximoGratis={perfil.proximo_gratis}
        />

        {/* ── [2] Preferências de Estilo ──────────────────────── */}
        <PreferenciasEstilo userId={perfil.whatsapp} />

        {/* ── Próximos agendamentos (placeholder) ─────────────── */}
        <div className="bg-[#121212] border border-[#1E1E1E] p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#6B6760]">
              Meus Agendamentos
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Scissors className="w-8 h-8 text-[#2A2A2A]" strokeWidth={1} />
            <p className="text-[#6B6760] text-sm">Nenhum agendamento pendente</p>
            <p className="text-[10px] text-[#3A3A3A]">Agende seu próximo horário abaixo</p>
          </div>
        </div>

        {/* ── [3] Cortes Anteriores ────────────────────────────── */}
        <CortesAnteriores
          historico={perfil.historico}
          onRepetir={handleRepetir}
        />

        {/* ── CTAs principais ──────────────────────────────────── */}
        <Link
          href="/agendar"
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-4",
            "text-sm font-semibold tracking-[0.15em] uppercase",
            "text-[#0B0B0B] bg-[#C9A84C]",
            "hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35]",
            "active:scale-[0.98] transition-all duration-300"
          )}
        >
          <CalendarDays className="w-4 h-4" strokeWidth={2} />
          Agendar Novo Horário
        </Link>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-4",
            "text-sm font-semibold tracking-[0.15em] uppercase",
            "text-[#6B6760] border border-[#2A2A2A]",
            "hover:border-red-900/60 hover:text-red-500",
            "active:scale-[0.98] transition-all duration-300"
          )}
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sair da Conta
        </button>

        <p className="text-center pb-4">
          <Link
            href="/"
            className="text-[11px] text-[#6B6760] hover:text-[#A8A49E] transition-colors tracking-wider uppercase"
          >
            ← Página Inicial
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   [1] Cartão Fidelidade
══════════════════════════════════════════════════════════════════ */
function CartaoFidelidade({
  preenchidos,
  total,
  premio,
  proximoGratis,
}: {
  preenchidos:  number;
  total:        number;
  premio:       string;
  proximoGratis: boolean;
}) {
  const faltam = total - preenchidos;
  const pct    = Math.min((preenchidos / total) * 100, 100);

  /* Anima a barra de progresso após montar */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="bg-[#121212] border border-[#C9A84C18] overflow-hidden">
      {/* Topo dourado */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C80] to-transparent" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#C9A84C] shrink-0" strokeWidth={1.5} />
            <h3 className="font-display text-base font-semibold text-[#F0EDE8]">
              Seu Cartão Fidelidade 💈
            </h3>
          </div>
          <span className="shrink-0 text-[10px] text-[#C9A84C] border border-[#C9A84C30] px-2 py-0.5 tracking-wider uppercase">
            {preenchidos}/{total}
          </span>
        </div>
        <p className="text-[11px] text-[#6B6760] mb-5 leading-relaxed">
          Complete{" "}
          <span className="text-[#A8A49E]">{total} cortes</span>{" "}
          e ganhe uma{" "}
          <span className="text-[#C9A84C] font-medium">{premio}</span>{" "}
          totalmente grátis!
        </p>

        {/* Slots — 5 colunas mobile, 10 desktop */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-5">
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < preenchidos;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.28, ease: "backOut" }}
                className={cn(
                  "relative aspect-square rounded-full flex items-center justify-center",
                  "border-2 transition-all duration-300",
                  filled
                    ? "bg-[#C9A84C] border-[#C9A84C] shadow-[0_0_10px_0_#C9A84C50]"
                    : "bg-[#0D0D0D] border-[#252525]"
                )}
              >
                {filled ? (
                  <Check className="w-3.5 h-3.5 text-[#0B0B0B]" strokeWidth={2.5} />
                ) : (
                  <Scissors
                    className="w-3 h-3 text-[#2A2A2A]"
                    strokeWidth={1}
                    style={{ transform: "rotate(-45deg)" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Barra de progresso */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#A07840] via-[#C9A84C] to-[#E6C97A] transition-all duration-1000 ease-out"
              style={{ width: mounted ? `${pct}%` : "0%" }}
            />
          </div>
          <span className="shrink-0 text-[11px] text-[#6B6760]">
            {pct.toFixed(0)}%
          </span>
        </div>

        {/* Texto motivacional / banner de prêmio */}
        {proximoGratis ? (
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-[#C9A84C12] border border-[#C9A84C40] rounded-lg">
            <Gift className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" strokeWidth={1.5} />
            <p className="text-[11px] text-[#C9A84C] font-semibold">
              🎉 Seu próximo corte é grátis! Apresente ao barbeiro.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <Gift className="w-3.5 h-3.5 text-[#C9A84C40] shrink-0" strokeWidth={1.5} />
            <p className="text-[10px] text-[#3A3A3A]">
              {faltam === 1
                ? `Falta apenas 1 corte para o seu prêmio!`
                : `Faltam ${faltam} cortes para o seu prêmio`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   [2] Preferências de Estilo — Tag Bank Interativo
══════════════════════════════════════════════════════════════════ */

const TAG_CATEGORIES = [
  {
    label: "Cabelo",
    tags: [
      "Degradê Navalhado", "Degradê Médio", "Corte Social",
      "Corte na Tesoura", "Mullet", "Buzz Cut",
      "Risco no Cabelo", "Platinado / Nevou",
    ],
  },
  {
    label: "Barba",
    tags: [
      "Barba Quadrada", "Barba Lenhador", "Barba Cerrada",
      "Barba Esculpida", "Ganha-pão / Cavanhaque", "Toalha Quente",
    ],
  },
  {
    label: "Outros",
    tags: ["Sobrancelha Navalhada", "Risco na Sobrancelha", "Depilação com Cera"],
  },
] satisfies { label: string; tags: string[] }[];

const DEFAULT_TAGS = ["Degradê Navalhado", "Risco na Sobrancelha", "Barba Quadrada"];

function PreferenciasEstilo({ userId }: { userId: string }) {
  const tagsKey = `inspire_style_tags_${userId}`;
  const notaKey = `inspire_style_nota_${userId}`;

  const [aberto,       setAberto]       = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [nota,         setNota]         = useState("");
  const [editandoNota, setEditandoNota] = useState(false);
  const initializedRef = useRef(false);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  /* Carrega do localStorage após hidratação (uma única vez) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(tagsKey);
      setSelectedTags(raw ? (JSON.parse(raw) as string[]) : [...DEFAULT_TAGS]);
    } catch { setSelectedTags([...DEFAULT_TAGS]); }
    try {
      setNota(localStorage.getItem(notaKey) ?? "");
    } catch {}
    initializedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-salva tags sempre que mudarem (após carregamento inicial) */
  useEffect(() => {
    if (!initializedRef.current) return;
    try { localStorage.setItem(tagsKey, JSON.stringify(selectedTags)); } catch {}
  }, [selectedTags, tagsKey]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleSalvarNota = () => {
    try { localStorage.setItem(notaKey, nota); } catch {}
    setEditandoNota(false);
  };

  useEffect(() => {
    if (editandoNota) textareaRef.current?.focus();
  }, [editandoNota]);

  const allTagsSelected = TAG_CATEGORIES.every(({ tags }) =>
    tags.every((t) => selectedTags.includes(t))
  );

  return (
    <div className="bg-[#121212] border border-[#1E1E1E] overflow-hidden">

      {/* ── Header toggle ──────────────────────────────────────── */}
      <button
        onClick={() => { setAberto((v) => !v); setEditandoNota(false); }}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
          <span className="font-display text-base font-semibold text-[#F0EDE8]">
            Minhas Preferências de Estilo
          </span>
          {selectedTags.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-[#0B0B0B] bg-[#C9A84C]">
              {selectedTags.length}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: aberto ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-[#6B6760]" strokeWidth={1.5} />
        </motion.div>
      </button>

      {/* ── Conteúdo expansível ────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            key="pref-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-[#1A1A1A]">

              {/* ── Tags Selecionadas ────────────────────────── */}
              <div className="px-5 pt-4 pb-3">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2.5">
                  Selecionadas
                </p>
                <AnimatePresence mode="popLayout">
                  {selectedTags.length === 0 ? (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] text-[#3A3A3A] italic py-1"
                    >
                      Nenhuma preferência selecionada — escolha abaixo
                    </motion.p>
                  ) : (
                    <motion.div layout className="flex flex-wrap gap-2">
                      <AnimatePresence mode="popLayout">
                        {selectedTags.map((tag) => (
                          <motion.button
                            key={tag}
                            layout
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.75, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 26 }}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5",
                              "text-[11px] font-medium tracking-wide",
                              "text-[#E6C97A] border border-[#C9A84C50] bg-[#C9A84C10]",
                              "hover:border-[#C9A84C80] hover:bg-[#C9A84C18]",
                              "active:scale-95 transition-colors duration-150"
                            )}
                          >
                            {tag}
                            <X className="w-3 h-3 shrink-0 text-[#C9A84C70]" strokeWidth={2.5} />
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Sugestões por Categoria ──────────────────── */}
              <div className="px-5 pb-4 pt-2 border-t border-[#161616]">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-3">
                  Sugestões
                </p>

                {allTagsSelected ? (
                  <p className="text-[11px] text-[#3A3A3A] italic py-1">
                    Todas as sugestões foram adicionadas!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {TAG_CATEGORIES.map(({ label, tags }) => {
                      const available = tags.filter((t) => !selectedTags.includes(t));
                      if (available.length === 0) return null;
                      return (
                        <div key={label}>
                          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#2E2E2E] mb-1.5">
                            {label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {available.map((tag) => (
                              <motion.button
                                key={tag}
                                layout
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                  "inline-flex items-center px-3 py-1.5",
                                  "text-[11px] font-medium text-[#6B6760]",
                                  "border border-[#1E1E1E] bg-[#0D0D0D]",
                                  "hover:border-[#C9A84C30] hover:text-[#A8A49E] hover:bg-[#C9A84C06]",
                                  "active:scale-95 transition-all duration-150"
                                )}
                              >
                                + {tag}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Observações Extras ────────────────────────── */}
              <div className="px-5 pb-5 pt-3 border-t border-[#161616]">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B6760] mb-2">
                  Observações para o Barbeiro
                </p>

                {/* Resumo das tags selecionadas como contexto */}
                {selectedTags.length > 0 && (
                  <p className="text-[11px] leading-relaxed mb-2">
                    <span className="text-[#C9A84C50]">Estilo: </span>
                    <span className="text-[#3A3A3A]">{selectedTags.join(", ")}</span>
                  </p>
                )}

                <AnimatePresence mode="wait">
                  {editandoNota ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <textarea
                        ref={textareaRef}
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        rows={3}
                        placeholder="Alergias, detalhes específicos, risco mais para a esquerda..."
                        className={cn(
                          "w-full bg-[#0D0D0D] border border-[#2A2A2A]",
                          "focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C20]",
                          "px-3 py-2.5 text-[16px] sm:text-sm text-[#F0EDE8]",
                          "placeholder:text-[#2A2A2A] outline-none resize-none",
                          "transition-all duration-200"
                        )}
                      />
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={handleSalvarNota}
                          className="text-[11px] text-[#C9A84C] hover:text-[#E6C97A] transition-colors font-semibold"
                        >
                          ✓ Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoNota(false)}
                          className="text-[11px] text-[#6B6760] hover:text-[#A8A49E] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setEditandoNota(true)}
                      className={cn(
                        "relative bg-[#0D0D0D] border border-[#1A1A1A]",
                        "px-3 py-3 cursor-pointer group min-h-[52px]",
                        "hover:border-[#C9A84C25] transition-colors duration-200"
                      )}
                    >
                      <p className="text-sm leading-relaxed pr-7">
                        {nota ? (
                          <span className="text-[#6B6760]">{nota}</span>
                        ) : (
                          <span className="text-[#2A2A2A] italic text-xs">
                            Toque para adicionar detalhes extras, alergias, etc.
                          </span>
                        )}
                      </p>
                      <Pencil
                        className="absolute right-3 top-3 w-3.5 h-3.5 text-[#2A2A2A] group-hover:text-[#C9A84C] transition-colors duration-200"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   [3] Cortes Anteriores — Histórico real do banco + Reagendamento
══════════════════════════════════════════════════════════════════ */
function CortesAnteriores({
  historico,
  onRepetir,
}: {
  historico: HistoricoItem[];
  onRepetir: (servicos: string[]) => void;
}) {
  return (
    <div className="bg-[#121212] border border-[#1E1E1E] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#1A1A1A]">
        <History className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#6B6760]">
          Cortes Anteriores
        </span>
        {historico.length > 0 && (
          <span className="ml-auto text-[10px] text-[#3A3A3A]">
            {historico.length} registro{historico.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lista */}
      {historico.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center px-5">
          <Scissors className="w-8 h-8 text-[#2A2A2A]" strokeWidth={1} />
          <p className="text-[#6B6760] text-sm">Nenhum corte registrado ainda</p>
          <p className="text-[10px] text-[#3A3A3A]">
            Seus cortes aparecerão aqui após o agendamento
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#121212]">
          {historico.map((h) => {
            const dataFormatada = new Date(h.data_agendamento + "T12:00:00")
              .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
            const descricao = h.servicos.join(", ") || "Corte";

            return (
              <div key={h.id} className="bg-[#0D0D0D] px-5 py-4">

                {/* Info do corte */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F0EDE8] leading-snug">
                      {descricao}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
                      {h.profissional_nome && (
                        <>
                          <span className="text-[11px] text-[#6B6760]">
                            {h.profissional_nome}
                          </span>
                          <span className="text-[#252525]">·</span>
                        </>
                      )}
                      <span className="text-[11px] text-[#6B6760]">
                        {dataFormatada} às {h.horario}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 font-display text-lg font-semibold text-[#C9A84C]">
                    R$ {Number(h.valor).toFixed(0)}
                  </span>
                </div>

                {/* Botão de repetição */}
                {h.servicos.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onRepetir(h.servicos)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3",
                      "text-xs font-semibold tracking-[0.15em] uppercase",
                      "text-[#C9A84C] border border-[#C9A84C30]",
                      "hover:border-[#C9A84C70] hover:bg-[#C9A84C08]",
                      "transition-all duration-200"
                    )}
                  >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                    Repetir este corte
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Info row ───────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-[#0D0D0D] px-4 py-3.5">
      <span className="shrink-0">{icon}</span>
      <span className="text-[10px] text-[#6B6760] tracking-wider uppercase w-16 shrink-0">{label}</span>
      <span className="text-sm text-[#A8A49E] min-w-0 truncate">{value}</span>
    </div>
  );
}
