"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Phone, Lock, User, Calendar,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BARBEARIA, mascaraTelefone } from "@/data/agendamento-dados";

/* ── Mock auth (localStorage) ───────────────────────────────────── */

interface MockUser {
  nome: string;
  whatsapp: string;   // apenas dígitos
  password: string;
  nascimento: string; // YYYY-MM-DD
  criadoEm: string;
}

const USERS_KEY   = "inspire_barber_users";
const SESSION_KEY = "inspire_barber_session";

function getUsers(): MockUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]"); }
  catch { return []; }
}

function findUser(whatsapp: string, password: string): MockUser | null {
  const digits = whatsapp.replace(/\D/g, "");
  return getUsers().find((u) => u.whatsapp === digits && u.password === password) ?? null;
}

function userExists(whatsapp: string): boolean {
  const digits = whatsapp.replace(/\D/g, "");
  return getUsers().some((u) => u.whatsapp === digits);
}

function registerUser(data: Omit<MockUser, "criadoEm">): MockUser {
  const user: MockUser = { ...data, criadoEm: new Date().toISOString() };
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
}

export function saveSession(user: Pick<MockUser, "nome" | "whatsapp">) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ nome: user.nome, whatsapp: user.whatsapp }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Pick<MockUser, "nome" | "whatsapp"> | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Variantes de animação ──────────────────────────────────────── */

const tabVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: {
    x: 0, opacity: 1,
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56, opacity: 0,
    transition: { duration: 0.18 },
  }),
};

type Tab = "login" | "cadastro";

/* ── Componente principal ───────────────────────────────────────── */

export function AuthScreen() {
  const router = useRouter();
  const [tab, setTab]   = useState<Tab>("login");
  const [dir, setDir]   = useState(1);
  const [globalMsg, setGlobalMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  /* Redireciona se já estiver autenticado */
  useEffect(() => {
    if (getSession()) router.replace("/perfil");
  }, [router]);

  const switchTab = (next: Tab) => {
    setDir(next === "cadastro" ? 1 : -1);
    setTab(next);
    setGlobalMsg(null);
  };

  const handleSuccess = (user: MockUser) => {
    saveSession(user);
    setGlobalMsg({ type: "success", text: `Bem-vindo, ${user.nome.split(" ")[0]}! Redirecionando...` });
    setTimeout(() => router.push("/perfil"), 1400);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-[#0B0B0B]">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,#C9A84C07_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="relative bg-[#121212] border border-[#C9A84C18] shadow-[0_0_80px_0_#00000080,inset_0_0_0_1px_#C9A84C08]">

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C28] pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C28] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C28] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C28] pointer-events-none" />

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="pt-10 pb-6 px-8 text-center border-b border-[#1A1A1A]">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A84C28] shadow-[0_0_28px_0_#C9A84C25]">
                <Image
                  src={BARBEARIA.logo}
                  alt={BARBEARIA.nome}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#F0EDE8] tracking-wide">
              {BARBEARIA.nome}
            </h1>
            <p className="text-[#6B6760] text-[10px] tracking-[0.35em] uppercase mt-1.5">
              Área do Cliente
            </p>
          </div>

          {/* ── Tabs ───────────────────────────────────────────── */}
          <div className="flex border-b border-[#1A1A1A]">
            {(["login", "cadastro"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  "relative flex-1 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase",
                  "transition-colors duration-200",
                  tab === t ? "text-[#C9A84C]" : "text-[#6B6760] hover:text-[#A8A49E]"
                )}
              >
                {t === "login" ? "Entrar" : "Criar Conta"}
                {tab === t && (
                  <motion.div
                    layoutId="tab-bar"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C]"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Feedback global ────────────────────────────────── */}
          <AnimatePresence>
            {globalMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    "mx-6 mt-5 px-4 py-3 flex items-center gap-3 text-xs",
                    globalMsg.type === "success"
                      ? "bg-[#C9A84C0C] border border-[#C9A84C30] text-[#C9A84C]"
                      : "bg-red-950/30 border border-red-900/40 text-red-400"
                  )}
                >
                  {globalMsg.type === "success"
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                    : <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                  }
                  <span>{globalMsg.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Conteúdo das abas ──────────────────────────────── */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={tab}
                custom={dir}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {tab === "login" ? (
                  <LoginForm
                    onSuccess={handleSuccess}
                    onError={(msg) => setGlobalMsg({ type: "error", text: msg })}
                    onSwitchTab={() => switchTab("cadastro")}
                  />
                ) : (
                  <CadastroForm
                    onSuccess={handleSuccess}
                    onError={(msg) => setGlobalMsg({ type: "error", text: msg })}
                    onSwitchTab={() => switchTab("login")}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer legal ───────────────────────────────────── */}
          <div className="px-8 pb-8 text-center">
            <p className="text-[10px] text-[#3A3A3A] leading-relaxed">
              Ao continuar você concorda com os{" "}
              <span className="text-[#6B6760] hover:text-[#C9A84C] cursor-pointer transition-colors">
                Termos de Uso
              </span>{" "}
              e a{" "}
              <span className="text-[#6B6760] hover:text-[#C9A84C] cursor-pointer transition-colors">
                Política de Privacidade
              </span>
              .
            </p>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-[11px] text-[#6B6760] hover:text-[#A8A49E] transition-colors tracking-wider uppercase"
          >
            ← Voltar para o início
          </Link>
        </p>

        {/* Atalho para o portal dos profissionais */}
        <Link
          href="/admin"
          className="mt-3 text-xs font-medium text-neutral-500 hover:text-amber-500 tracking-wide transition-colors cursor-pointer block text-center"
        >
          Sou Profissional →
        </Link>
      </div>
    </div>
  );
}

/* ── Login Form ─────────────────────────────────────────────────── */

function LoginForm({
  onSuccess,
  onError,
  onSwitchTab,
}: {
  onSuccess: (user: MockUser) => void;
  onError: (msg: string) => void;
  onSwitchTab: () => void;
}) {
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({ whatsapp: false, password: false });

  const digits   = whatsapp.replace(/\D/g, "");
  const errPhone = touched.whatsapp && digits.length < 11;
  const errPw    = touched.password && password.length < 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ whatsapp: true, password: true });
    if (digits.length < 11 || password.length < 6) return;

    setLoading(true);
    /* Simula latência de rede (600 ms) */
    setTimeout(() => {
      const user = findUser(whatsapp, password);
      setLoading(false);
      if (user) {
        onSuccess(user);
      } else {
        onError("WhatsApp ou senha incorretos. Verifique e tente novamente.");
      }
    }, 600);
  };

  const handleEsqueciSenha = () => {
    const msg = "Olá! Preciso recuperar minha senha da Inspire Barber Studio.";
    window.open(`https://wa.me/${BARBEARIA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">

      {/* WhatsApp */}
      <Field
        id="l-wa" label="WhatsApp"
        icon={<Phone className="w-4 h-4" strokeWidth={1.5} />}
        error={errPhone ? "Número incompleto — informe DDD + 9 dígitos" : undefined}
      >
        <input
          id="l-wa" type="tel" inputMode="numeric" autoComplete="tel"
          placeholder="(47) 99999-9999" maxLength={16}
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascaraTelefone(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
          className={inputCls(errPhone)}
        />
      </Field>

      {/* Senha */}
      <Field
        id="l-pw" label="Senha"
        icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
        error={errPw ? "Senha muito curta (mínimo 6 caracteres)" : undefined}
        suffix={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
      >
        <input
          id="l-pw" type={showPw ? "text" : "password"} autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          className={cn(inputCls(errPw), "pr-10")}
        />
      </Field>

      {/* Esqueci a senha */}
      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleEsqueciSenha}
          className="text-[11px] text-[#C9A84C60] hover:text-[#C9A84C] transition-colors tracking-wide"
        >
          Esqueci minha senha
        </button>
      </div>

      {/* CTA */}
      <SubmitBtn loading={loading} loadingText="Verificando...">Entrar na Minha Conta</SubmitBtn>

      <p className="text-center text-[11px] text-[#6B6760] pb-1">
        Ainda não tem conta?{" "}
        <button
          type="button" onClick={onSwitchTab}
          className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors font-semibold"
        >
          Criar agora
        </button>
      </p>
    </form>
  );
}

/* ── Cadastro Form ──────────────────────────────────────────────── */

function CadastroForm({
  onSuccess,
  onError,
  onSwitchTab,
}: {
  onSuccess: (user: MockUser) => void;
  onError: (msg: string) => void;
  onSwitchTab: () => void;
}) {
  const nomeRef = useRef<HTMLInputElement>(null);

  const [nome,      setNome]      = useState("");
  const [whatsapp,  setWhatsapp]  = useState("");
  const [nasc,      setNasc]      = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [showCp,    setShowCp]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [touched,   setTouched]   = useState({
    nome: false, whatsapp: false, nasc: false, password: false, confirmPw: false,
  });

  useEffect(() => { nomeRef.current?.focus(); }, []);

  const digits    = whatsapp.replace(/\D/g, "");
  const nomeOk    = nome.trim().split(/\s+/).length >= 2 && nome.trim().length >= 5;

  const err = {
    nome:      touched.nome      && !nomeOk,
    whatsapp:  touched.whatsapp  && digits.length < 11,
    nasc:      touched.nasc      && !nasc,
    password:  touched.password  && password.length < 6,
    confirmPw: touched.confirmPw && confirmPw !== password,
  };

  /* Date limits: mín. 10 anos de idade */
  const today  = new Date();
  const maxDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
    .toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nome: true, whatsapp: true, nasc: true, password: true, confirmPw: true });

    if (!nomeOk || digits.length < 11 || !nasc || password.length < 6 || password !== confirmPw) return;

    if (userExists(whatsapp)) {
      onError("Este WhatsApp já está cadastrado. Faça login ou recupere sua senha.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = registerUser({
        nome: nome.trim(), whatsapp: digits, password, nascimento: nasc,
      });
      onSuccess(user);
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-4">

      {/* Nome */}
      <Field
        id="c-nome" label="Nome Completo"
        icon={<User className="w-4 h-4" strokeWidth={1.5} />}
        error={err.nome ? "Informe nome e sobrenome" : undefined}
      >
        <input
          ref={nomeRef} id="c-nome" type="text"
          autoComplete="name" autoCapitalize="words"
          placeholder="Ex: João da Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, nome: true }))}
          className={inputCls(err.nome)}
        />
      </Field>

      {/* WhatsApp */}
      <Field
        id="c-wa" label="WhatsApp"
        icon={<Phone className="w-4 h-4" strokeWidth={1.5} />}
        error={err.whatsapp ? "Número incompleto — informe DDD + 9 dígitos" : undefined}
      >
        <input
          id="c-wa" type="tel" inputMode="numeric" autoComplete="tel"
          placeholder="(47) 99999-9999" maxLength={16}
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascaraTelefone(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
          className={inputCls(err.whatsapp)}
        />
      </Field>

      {/* Data de Nascimento */}
      <Field
        id="c-nasc" label="Data de Nascimento"
        icon={<Calendar className="w-4 h-4" strokeWidth={1.5} />}
        error={err.nasc ? "Informe sua data de nascimento" : undefined}
      >
        <input
          id="c-nasc" type="date"
          min="1930-01-01" max={maxDate}
          value={nasc}
          onChange={(e) => setNasc(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, nasc: true }))}
          /* [color-scheme:dark] força o picker nativo a usar paleta escura */
          className={cn(inputCls(err.nasc), "[color-scheme:dark]")}
        />
      </Field>

      {/* Criar senha */}
      <Field
        id="c-pw" label="Criar Senha"
        icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
        error={err.password ? "Mínimo de 6 caracteres" : undefined}
        suffix={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
      >
        <input
          id="c-pw" type={showPw ? "text" : "password"} autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          className={cn(inputCls(err.password), "pr-10")}
        />
      </Field>

      {/* Confirmar senha */}
      <Field
        id="c-cp" label="Confirmar Senha"
        icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
        error={err.confirmPw ? "As senhas não coincidem" : undefined}
        suffix={<EyeToggle show={showCp} onToggle={() => setShowCp((v) => !v)} />}
      >
        <input
          id="c-cp" type={showCp ? "text" : "password"} autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirmPw: true }))}
          className={cn(inputCls(err.confirmPw), "pr-10")}
        />
      </Field>

      {/* CTA */}
      <div className="pt-1">
        <SubmitBtn loading={loading} loadingText="Criando conta...">Concluir Cadastro</SubmitBtn>
      </div>

      <p className="text-center text-[11px] text-[#6B6760] pb-1">
        Já tem conta?{" "}
        <button
          type="button" onClick={onSwitchTab}
          className="text-[#C9A84C] hover:text-[#E6C97A] transition-colors font-semibold"
        >
          Entrar agora
        </button>
      </p>
    </form>
  );
}

/* ── Componentes auxiliares ─────────────────────────────────────── */

function Field({
  id, label, icon, error, suffix, children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A8A49E] mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]">
          {icon}
        </span>
        {children}
        {suffix && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[11px] text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="p-1 text-[#6B6760] hover:text-[#A8A49E] transition-colors"
      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
    >
      {show
        ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
        : <Eye    className="w-4 h-4" strokeWidth={1.5} />
      }
    </button>
  );
}

function SubmitBtn({
  loading,
  loadingText = "Aguarde...",
  children,
}: {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "w-full py-4 text-sm font-semibold tracking-[0.15em] uppercase",
        "transition-all duration-300",
        loading
          ? "bg-[#1A1A1A] text-[#6B6760] cursor-not-allowed"
          : "text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35] active:scale-[0.98]"
      )}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingText}
        </span>
      ) : children}
    </button>
  );
}

/* ── Input class helper ─────────────────────────────────────────── */
function inputCls(hasError?: boolean) {
  return cn(
    "w-full bg-[#0D0D0D] pl-10 pr-4",
    /* py-4 mobile previne iOS auto-zoom (font-size=16px + altura confortável) */
    "py-4 sm:py-3.5",
    "text-[16px] sm:text-sm text-[#F0EDE8] placeholder:text-[#2A2A2A]",
    "border outline-none transition-all duration-200",
    hasError
      ? "border-red-800/70 focus:border-red-600"
      : "border-[#2A2A2A] focus:border-[#C9A84C] focus:shadow-[0_0_0_1px_#C9A84C20]"
  );
}
