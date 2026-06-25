"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Clock, CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  type Servico,
  type Profissional,
  formatarPreco,
  formatarDuracao,
  mascaraTelefone,
} from "@/data/agendamento-dados";
import { getSession } from "@/components/auth/auth-screen";
import { cn } from "@/lib/utils";

/* ── Tipos ──────────────────────────────────────────────────────── */
interface EtapaIdentificacaoProps {
  nome: string;
  whatsapp: string;
  onNomeChange: (v: string) => void;
  onWhatsappChange: (v: string) => void;
  onConfirmar: () => void;
  servicosObj: Servico[];
  profissional: Profissional;
  data: Date | undefined;
  horario: string | null;
  totalPreco: number;
  totalDuracao: number;
}

/* ── Helpers ────────────────────────────────────────────────────── */
function digitsToMask(d: string): string {
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : d;
}

function getInitials(nome: string): string {
  return nome.split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

/* ══════════════════════════════════════════════════════════════════
   Componente principal
══════════════════════════════════════════════════════════════════ */
export function EtapaIdentificacao({
  nome,
  whatsapp,
  onNomeChange,
  onWhatsappChange,
  onConfirmar,
  servicosObj,
  profissional,
  data,
  horario,
  totalPreco,
  totalDuracao,
}: EtapaIdentificacaoProps) {
  /* ── Detecção de sessão (executa apenas no cliente, após hidratação) */
  const [session, setSession] = useState<{ nome: string; whatsapp: string } | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setSession(s);
    /* Propaga ao estado do pai para que a msg do WhatsApp saia correta */
    onNomeChange(s.nome);
    onWhatsappChange(digitsToMask(s.whatsapp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // dispara uma única vez na montagem

  /* ── Validação (usada apenas no fluxo anônimo) ──────────────────── */
  const [touched,   setTouched]   = useState({ nome: false, whatsapp: false });
  const [honeypot,  setHoneypot]  = useState("");

  const nomeValido     = nome.trim().split(" ").length >= 2 && nome.trim().length >= 5;
  const whatsappValido = whatsapp.replace(/\D/g, "").length === 11;

  /* Com sessão ativa os dados já são válidos; sem sessão valida manualmente */
  const podeConfirmar = session !== null || (nomeValido && whatsappValido);

  const erroNome     = !session && touched.nome     && !nomeValido;
  const erroWhatsapp = !session && touched.whatsapp && !whatsappValido;

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    /* Honeypot: campo invisível preenchido → bot detectado, rejeita silenciosamente */
    if (honeypot) return;

    /* Usuário logado: dados já garantidos, confirma direto */
    if (session) { onConfirmar(); return; }

    /* Anônimo: valida manualmente */
    setTouched({ nome: true, whatsapp: true });
    if (podeConfirmar) onConfirmar();
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="pt-2 pb-16">

      {/* ── Título dinâmico ──────────────────────────────────────── */}
      <div className="py-5 border-b border-[#1A1A1A] mb-6">
        <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
          Seus dados
        </h2>
        <p className="text-[#6B6760] text-xs mt-0.5">
          {session
            ? "Dados carregados do seu perfil — pronto para confirmar"
            : "Último passo — confirme seus dados para finalizar"}
        </p>
      </div>

      {/* ── Resumo do agendamento ────────────────────────────────── */}
      <div className="bg-[#111111] border border-[#1E1E1E] mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={2} />
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#6B6760]">
            Resumo do Agendamento
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Serviços */}
          <div className="space-y-1.5">
            {servicosObj.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-[#A8A49E]">{s.nome}</span>
                <span className="text-[#C9A84C] font-semibold tabular-nums">
                  {formatarPreco(s.preco)}
                </span>
              </div>
            ))}
          </div>

          <div className="divider-gold opacity-50" />

          {/* Totais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-2.5">
              <span className="block text-[9px] text-[#6B6760] tracking-wider uppercase mb-0.5">
                Total
              </span>
              <span className="font-display text-lg font-semibold text-[#C9A84C]">
                {formatarPreco(totalPreco)}
              </span>
            </div>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-2.5">
              <span className="block text-[9px] text-[#6B6760] tracking-wider uppercase mb-0.5">
                Duração
              </span>
              <span className="font-display text-lg font-semibold text-[#F0EDE8]">
                {formatarDuracao(totalDuracao)}
              </span>
            </div>
          </div>

          {/* Detalhes: profissional, data, horário */}
          <div className="space-y-2">
            <InfoRow
              icon={<User className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
              label="Profissional"
              value={profissional.nome}
            />
            {data && (
              <InfoRow
                icon={<CalendarDays className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
                label="Data"
                value={data.toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long",
                })}
              />
            )}
            {horario && (
              <InfoRow
                icon={<Clock className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />}
                label="Horário"
                value={horario}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Seção de dados de contato (condicional) ──────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Honeypot — invisível para humanos, detecta automação */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
        />

        <AnimatePresence mode="wait" initial={false}>

          {/* ── CENÁRIO A: Usuário logado ────────────────────────── */}
          {session ? (
            <motion.div
              key="logado"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <IdentidadeCard session={session} />
            </motion.div>

          ) : (

            /* ── CENÁRIO B: Usuário anônimo — formulário manual ─── */
            <motion.div
              key="anonimo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Nome */}
              <fieldset>
                <label
                  htmlFor="nome"
                  className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A8A49E] mb-2"
                >
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6760]"
                    strokeWidth={1.5}
                  />
                  <input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    autoCapitalize="words"
                    value={nome}
                    onChange={(e) => onNomeChange(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, nome: true }))}
                    placeholder="Ex: João da Silva"
                    className={cn(
                      "w-full bg-[#111111] pl-10 pr-4 py-4 sm:py-3.5",
                      "text-[16px] sm:text-sm text-[#F0EDE8] placeholder:text-[#3A3A3A]",
                      "border outline-none transition-all duration-200",
                      erroNome
                        ? "border-red-900 focus:border-red-700"
                        : "border-[#2A2A2A] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C20]"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {erroNome && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1.5 text-[11px] text-red-600"
                    >
                      Informe seu nome completo (nome e sobrenome)
                    </motion.p>
                  )}
                </AnimatePresence>
              </fieldset>

              {/* WhatsApp */}
              <fieldset>
                <label
                  htmlFor="whatsapp"
                  className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A8A49E] mb-2"
                >
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6760]"
                    strokeWidth={1.5}
                  />
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoCorrect="off"
                    autoCapitalize="none"
                    value={whatsapp}
                    onChange={(e) => onWhatsappChange(mascaraTelefone(e.target.value))}
                    onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                    placeholder="(47) 99999-9999"
                    maxLength={16}
                    className={cn(
                      "w-full bg-[#111111] pl-10 pr-4 py-4 sm:py-3.5",
                      "text-[16px] sm:text-sm text-[#F0EDE8] placeholder:text-[#3A3A3A]",
                      "border outline-none transition-all duration-200",
                      erroWhatsapp
                        ? "border-red-900 focus:border-red-700"
                        : "border-[#2A2A2A] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C20]"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {erroWhatsapp && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1.5 text-[11px] text-red-600"
                    >
                      Informe um número de celular válido com DDD
                    </motion.p>
                  )}
                </AnimatePresence>
              </fieldset>

              {/* Sugestão de login para usuários anônimos */}
              <p className="text-[11px] text-[#6B6760] text-center">
                Já tem conta?{" "}
                <Link
                  href="/auth"
                  className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors font-semibold"
                >
                  Entre para preencher automaticamente
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Botão de confirmação ─────────────────────────────── */}
        <button
          type="submit"
          className={cn(
            "w-full mt-2 py-4 text-sm font-semibold tracking-[0.15em] uppercase",
            "transition-all duration-300",
            podeConfirmar
              ? "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C40] active:scale-[0.98]"
              : "text-[#6B6760] bg-[#1A1A1A] cursor-not-allowed"
          )}
        >
          Confirmar Agendamento
        </button>

        <p className="text-center text-[10px] text-[#6B6760]">
          Você será redirecionado ao WhatsApp para confirmação final
        </p>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Card de identidade — exibido quando o usuário está logado
══════════════════════════════════════════════════════════════════ */
function IdentidadeCard({
  session,
}: {
  session: { nome: string; whatsapp: string };
}) {
  const initials = getInitials(session.nome);
  const phone    = digitsToMask(session.whatsapp);

  return (
    <div className="bg-[#0D0D0D] border border-[#C9A84C20] overflow-hidden">

      {/* Banner de confirmação automática */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#C9A84C08] border-b border-[#C9A84C15]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" strokeWidth={2} />
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
          Dados confirmados automaticamente
        </span>
      </div>

      {/* Identidade */}
      <div className="flex items-center gap-4 p-4">
        {/* Avatar com iniciais */}
        <div
          className={cn(
            "w-12 h-12 shrink-0 flex items-center justify-center",
            "bg-[#C9A84C12] border border-[#C9A84C30]",
            "font-display text-lg font-semibold text-[#C9A84C]"
          )}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-[#F0EDE8] truncate leading-tight">
            {session.nome}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Phone className="w-3 h-3 text-[#C9A84C40] shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-[#6B6760]">{phone}</span>
          </div>
        </div>
      </div>

      {/* Rodapé: link de troca */}
      <div className="px-4 py-2.5 border-t border-[#1A1A1A]">
        <Link
          href="/auth"
          className="text-[11px] text-[#6B6760] hover:text-[#C9A84C] transition-colors duration-200"
        >
          Não é você? → Trocar conta
        </Link>
      </div>
    </div>
  );
}

/* ── Linha de info do resumo ────────────────────────────────────── */
function InfoRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0">{icon}</span>
      <span className="text-[#6B6760] text-xs shrink-0 w-20">{label}</span>
      <span className="text-[#A8A49E] text-xs capitalize leading-tight">{value}</span>
    </div>
  );
}
