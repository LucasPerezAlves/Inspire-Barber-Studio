"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scissors, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession } from "@/components/auth/auth-screen";

function getInitials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const NAV_LINKS = [
  { label: "Início",   href: "/" },
  { label: "Serviços", href: "#servicos" },
  { label: "Equipe",   href: "#equipe" },
  { label: "Sobre",    href: "#sobre" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<{ nome: string; whatsapp: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSession(getSession());
  }, []);

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
            {/* Mobile: short name */}
            <span className="md:hidden text-sm">
              Inspire <span className="text-[#C9A84C]">Barber</span>
            </span>
            {/* Desktop: full name */}
            <span className="hidden md:inline text-xl">
              Inspire <span className="text-[#C9A84C] text-base">Studio</span>
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative text-sm font-medium tracking-wider uppercase",
                  "text-[#A8A49E] hover:text-[#F0EDE8] transition-colors duration-200",
                  "after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0",
                  "after:bg-[#C9A84C] after:transition-all after:duration-300",
                  "hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop: link "Minha Conta" + CTA "Agendar" */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth"
            className={cn(
              "relative text-sm font-medium tracking-wider uppercase",
              "text-[#A8A49E] hover:text-[#F0EDE8] transition-colors duration-200",
              "after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0",
              "after:bg-[#C9A84C] after:transition-all after:duration-300",
              "hover:after:w-full"
            )}
          >
            Minha Conta
          </Link>
          <Link
            href="/agendar"
            className={cn(
              "inline-flex items-center px-6 py-2.5 text-sm font-semibold tracking-[0.12em] uppercase",
              "text-[#0B0B0B] bg-[#C9A84C] border border-[#C9A84C]",
              "hover:bg-[#E6C97A] hover:shadow-[0_0_24px_0_#C9A84C40]",
              "active:scale-[0.97] transition-all duration-300"
            )}
          >
            Agendar
          </Link>
        </div>

        {/* Mobile: ícone de conta + CTA Agendar */}
        <div className="md:hidden flex items-center gap-2">

          {/* Conta — avatar com iniciais (logado) ou ícone (anônimo) */}
          {session ? (
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              className="flex items-center justify-center w-9 h-9 shrink-0 bg-[#C9A84C12] border border-[#C9A84C40] active:scale-95 transition-all duration-200"
            >
              <span className="font-display text-[11px] font-semibold text-[#C9A84C]">
                {getInitials(session.nome)}
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
