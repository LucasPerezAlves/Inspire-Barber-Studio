"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Scissors, UserCircle, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession, logoutCliente } from "@/components/auth/auth-screen";

/* ── Estado de sessão do profissional (admin) ───────────────────────
   Separado da sessão de cliente (localStorage).
   O cookie HttpOnly é inacessível via JS — /api/admin/me é o único
   canal legítimo para saber se há uma sessão admin ativa.
─────────────────────────────────────────────────────────────────── */
type AdminState =
  | { status: "loading" }
  | { status: "admin"; nome: string; slug: string; role: "OWNER" | "BARBER" }
  | { status: "guest" };

function getInitials(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const NAV_LINKS = [
  { label: "Início",   href: "/" },
  { label: "Serviços", href: "#servicos" },
  { label: "Equipe",   href: "#equipe" },
  { label: "Sobre",    href: "#sobre" },
] as const;

/* ── Estilo compartilhado do link de navegação desktop ──────────── */
const navLinkCls = cn(
  "relative text-sm font-medium tracking-wider uppercase",
  "text-[#A8A49E] hover:text-[#F0EDE8] transition-colors duration-200",
  "after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0",
  "after:bg-[#C9A84C] after:transition-all after:duration-300",
  "hover:after:w-full"
);

export function Navbar() {
  /* usePathname atualiza sempre que o usuário navega entre rotas.
     Usamos como dependência do useEffect de sessão para garantir que
     a Navbar re-verifique o cookie após login/logout client-side.
     Sem isso, o root layout (onde a Navbar vive) nunca é desmontado
     durante navegações client-side, e o useEffect com [] só rodaria
     uma única vez — perdendo o estado de sessão após o login.       */
  const pathname = usePathname();

  const [scrolled,        setScrolled]       = useState(false);
  const [adminState,      setAdminState]     = useState<AdminState>({ status: "loading" });
  const [customerSession, setCustomerSession] = useState<{ nome: string; whatsapp: string } | null>(null);

  /* ── Scroll listener ────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Sessão do cliente (localStorage — sistema independente) ────── */
  useEffect(() => {
    setCustomerSession(getSession());
  }, [pathname]); // pathname como dep: re-lê o localStorage a cada navegação

  /* ── Reidratação da sessão admin via cookie HttpOnly ─────────────
     Roda na montagem inicial E toda vez que `pathname` muda.

     Por que pathname como dep? Porque o root layout nunca desmonta
     durante navegação client-side. Sem essa dep, o useEffect rodaria
     apenas uma vez (ex: na visita inicial `/`). Se o usuário logar em
     `/admin` e o cookie for setado, `router.push('/admin/pablo')` muda
     o pathname → esse effect re-roda → detecta a sessão → Navbar
     atualiza para "Painel — Pablo" sem precisar de reload completo.

     credentials:"include" — garante envio do cookie HttpOnly mesmo
       em navegações que poderiam ser tratadas como cross-site.
     cache:"no-store" — impede que o browser sirva uma resposta 401
       cacheada de uma visita anterior, mascarando a sessão ativa.
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch("/api/admin/me", {
      credentials: "include",
      cache:       "no-store",
    })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((data: { authenticated: boolean; nome?: string; slug?: string; role?: "OWNER" | "BARBER" }) => {
        if (data?.authenticated && data.nome && data.slug && data.role) {
          setAdminState({
            status: "admin",
            nome:   data.nome,
            slug:   data.slug,
            role:   data.role,
          });
        } else {
          setAdminState({ status: "guest" });
        }
      })
      .catch(() => setAdminState({ status: "guest" }));
  }, [pathname]); // re-verifica a cada mudança de rota

  /* ── Logout ──────────────────────────────────────────────────────
     POST limpa o cookie no servidor; atualizamos o estado local
     imediatamente para que a UI mude sem esperar reload de página.
  ─────────────────────────────────────────────────────────────────── */
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setAdminState({ status: "guest" });
    }
  }, []);

  /* Logout do cliente: chama API para remover o cookie HttpOnly E
     limpa o cache localStorage. Isolado do sistema admin.            */
  const handleCustomerLogout = useCallback(async () => {
    await logoutCliente();
    setCustomerSession(null);
  }, []);

  const isAdmin   = adminState.status === "admin";
  const isLoading = adminState.status === "loading";
  const primeiroNome = isAdmin ? adminState.nome.split(" ")[0] : "";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glass shadow-[0_4px_32px_0_#00000080]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group"
          aria-label="Inspire Barber — Página inicial"
        >
          <span
            className={cn(
              "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-sm",
              "border border-[#C9A84C40] bg-[#C9A84C10]",
              "transition-all duration-300 group-hover:bg-[#C9A84C20] group-hover:border-[#C9A84C80]"
            )}
          >
            <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A84C]" strokeWidth={1.5} />
          </span>
          <span className="font-display font-semibold tracking-widest uppercase text-[#F0EDE8]">
            <span className="md:hidden text-sm">
              Inspire <span className="text-[#C9A84C]">Barber</span>
            </span>
            <span className="hidden md:inline text-xl">
              Inspire <span className="text-[#C9A84C] text-base">Studio</span>
            </span>
          </span>
        </Link>

        {/* Desktop: links de navegação centrais */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={navLinkCls}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop: área de autenticação direita */}
        <div className="hidden md:flex items-center gap-4">

          {isLoading ? (
            /* Skeleton com largura similar a "Minha Conta" — evita CLS */
            <div
              className="h-3.5 w-24 rounded-sm bg-[#1E1E1E] animate-pulse"
              aria-hidden="true"
            />
          ) : isAdmin ? (
            /* ── Admin autenticado ─────────────────────────────────── */
            <>
              <Link
                href={`/admin/${adminState.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  "text-sm font-medium tracking-wider uppercase",
                  "text-[#C9A84C] hover:text-[#E6C97A] transition-colors duration-200"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                Painel — {primeiroNome}
              </Link>

              <span className="text-[#2A2A2A] select-none" aria-hidden="true">|</span>

              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "inline-flex items-center gap-1",
                  "text-xs font-medium tracking-wider uppercase",
                  "text-[#6B6760] hover:text-red-400 transition-colors duration-200"
                )}
              >
                <LogOut className="w-3 h-3" strokeWidth={1.5} />
                Sair
              </button>
            </>
          ) : customerSession ? (
            /* ── Cliente autenticado ────────────────────────────────── */
            <>
              <Link
                href="/perfil"
                className={cn(
                  "inline-flex items-center gap-1.5",
                  "text-sm font-medium tracking-wider uppercase",
                  "text-[#A8A49E] hover:text-[#F0EDE8] transition-colors duration-200"
                )}
              >
                Olá, {customerSession.nome.split(" ")[0]}
              </Link>

              <span className="text-[#2A2A2A] select-none" aria-hidden="true">|</span>

              <button
                type="button"
                onClick={handleCustomerLogout}
                className={cn(
                  "inline-flex items-center gap-1",
                  "text-xs font-medium tracking-wider uppercase",
                  "text-[#6B6760] hover:text-red-400 transition-colors duration-200"
                )}
              >
                <LogOut className="w-3 h-3" strokeWidth={1.5} />
                Sair
              </button>
            </>
          ) : (
            /* ── Visitante ─────────────────────────────────────────── */
            <Link href="/auth" className={navLinkCls}>
              Minha Conta
            </Link>
          )}

          {/* CTA Agendar — sempre visível */}
          <Link
            href="/agendar"
            className={cn(
              "inline-flex items-center px-6 py-2.5",
              "text-sm font-semibold tracking-[0.12em] uppercase",
              "text-[#0B0B0B] bg-[#C9A84C] border border-[#C9A84C]",
              "hover:bg-[#E6C97A] hover:shadow-[0_0_24px_0_#C9A84C40]",
              "active:scale-[0.97] transition-all duration-300"
            )}
          >
            Agendar
          </Link>
        </div>

        {/* Mobile: conta + CTA Agendar */}
        <div className="md:hidden flex items-center gap-2">

          {/* Admin → avatar dourado → painel
              Cliente → iniciais → /perfil
              Visitante → ícone → /auth                               */}
          {isAdmin ? (
            <Link
              href={`/admin/${adminState.slug}`}
              aria-label={`Painel de ${primeiroNome}`}
              className={cn(
                "flex items-center justify-center w-9 h-9 shrink-0",
                "bg-[#C9A84C20] border border-[#C9A84C60]",
                "active:scale-95 transition-all duration-200"
              )}
            >
              <span className="font-display text-[11px] font-semibold text-[#C9A84C]">
                {getInitials(adminState.nome)}
              </span>
            </Link>
          ) : customerSession ? (
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              className={cn(
                "flex items-center justify-center w-9 h-9 shrink-0",
                "bg-[#C9A84C12] border border-[#C9A84C40]",
                "active:scale-95 transition-all duration-200"
              )}
            >
              <span className="font-display text-[11px] font-semibold text-[#C9A84C]">
                {getInitials(customerSession.nome)}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth"
              aria-label="Entrar na conta"
              className={cn(
                "flex items-center justify-center w-9 h-9 shrink-0",
                "border border-[#2A2A2A] text-[#6B6760]",
                "hover:border-[#C9A84C40] hover:text-[#C9A84C]",
                "active:scale-95 transition-all duration-200"
              )}
            >
              <UserCircle className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          )}

          {/* Agendar */}
          <Link
            href="/agendar"
            className={cn(
              "inline-flex items-center px-4 py-2.5",
              "text-[11px] font-semibold tracking-[0.15em] uppercase",
              "text-[#0B0B0B] bg-[#C9A84C]",
              "active:scale-[0.97] transition-all duration-300"
            )}
          >
            Agendar
          </Link>
        </div>

      </nav>
    </header>
  );
}
