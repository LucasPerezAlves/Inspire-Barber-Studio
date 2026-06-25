/* Server Component */

import Link from "next/link";
import { MapPin, Phone, Clock, Instagram, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const HORARIOS = [
  { dias: "Terça — Sexta", horas: "09:00 — 20:00" },
  { dias: "Sábado",         horas: "09:00 — 20:00" },
  { dias: "Dom & Segunda",  horas: "Fechado"        },
] as const;

const NAV_LINKS = [
  { label: "Início",      href: "#inicio"    },
  { label: "Serviços",    href: "#servicos"  },
  { label: "Equipe",      href: "#equipe"    },
  { label: "Sobre",       href: "#sobre"     },
  { label: "Agendamento", href: "/agendar"   },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#161616]">
      <div className="divider-gold" />

      {/* Grade principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* ── Marca ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Link href="/" className="group inline-flex items-center gap-3 mb-5 w-fit">
            <span className={cn(
              "flex items-center justify-center w-8 h-8",
              "border border-[#C9A84C30] bg-[#C9A84C08]",
              "group-hover:border-[#C9A84C60] transition-colors duration-300"
            )}>
              <Scissors className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-widest uppercase text-[#F0EDE8]">
              Inspire <span className="text-[#C9A84C]">Barber</span>
            </span>
          </Link>

          <p className="font-mono text-[11px] text-[#4A4A4A] leading-relaxed tracking-wide max-w-[200px] mb-6">
            Barbearia premium em Blumenau — SC. Qualidade e estilo em cada detalhe.
          </p>

          <Link
            href="https://www.instagram.com/inspire.barberstudio/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Inspire Barber Studio"
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2",
              "border border-[#1E1E1E] text-[#6B6760]",
              "hover:border-[#C9A84C40] hover:text-[#C9A84C]",
              "transition-all duration-200"
            )}
          >
            <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
              @inspire.barberstudio
            </span>
          </Link>
        </div>

        {/* ── Navegação ─────────────────────────────────────────── */}
        <div>
          <h3 className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#3A3A3A] mb-5">
            Navegação
          </h3>
          <ul className="flex flex-col gap-2.5">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "font-mono text-xs text-[#6B6760]",
                    "hover:text-[#C9A84C] transition-colors duration-200",
                    "before:content-[''] before:block before:w-1 before:h-px before:bg-[#C9A84C30]"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Horários ──────────────────────────────────────────── */}
        <div>
          <h3 className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#3A3A3A] mb-5">
            Horários
          </h3>
          <ul className="flex flex-col gap-4">
            {HORARIOS.map(({ dias, horas }) => (
              <li key={dias}>
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A] mb-0.5">
                  {dias}
                </span>
                {horas === "Fechado" ? (
                  <span className="font-mono text-xs text-[#3A3A3A] italic">{horas}</span>
                ) : (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-[#A8A49E]">
                    <Clock className="w-3 h-3 text-[#C9A84C40]" strokeWidth={1.5} />
                    {horas}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contato + CTA ─────────────────────────────────────── */}
        <div>
          <h3 className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#3A3A3A] mb-5">
            Contato
          </h3>

          <ul className="flex flex-col gap-4 mb-7">
            <li>
              <Link
                href="https://maps.app.goo.gl/inspire-barber-studio-blumenau"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 text-xs text-[#6B6760] hover:text-[#A8A49E] transition-colors group"
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9A84C40] group-hover:text-[#C9A84C] transition-colors" strokeWidth={1.5} />
                <span className="font-mono leading-relaxed text-[11px]">
                  R. 9 de Agosto, 125<br />
                  Itoupava Norte — Blumenau, SC
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="tel:+5547991011904"
                className="flex items-center gap-3 font-mono text-xs text-[#6B6760] hover:text-[#A8A49E] transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#C9A84C40] group-hover:text-[#C9A84C] transition-colors" strokeWidth={1.5} />
                (47) 99101-1904
              </Link>
            </li>
          </ul>

          <Link
            href="/agendar"
            className={cn(
              "flex items-center justify-center w-full py-3",
              "font-mono text-[11px] tracking-[0.15em] uppercase font-semibold",
              "text-[#0B0B0B] bg-[#C9A84C]",
              "hover:bg-[#E6C97A] hover:shadow-[0_0_20px_0_#C9A84C30]",
              "transition-all duration-300 active:scale-[0.97]"
            )}
          >
            Agendar Agora
          </Link>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-[#161616]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-[#2E2E2E] tracking-wider">
            &copy; {new Date().getFullYear()} Inspire Barber Studio — Blumenau, SC
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="#"
              className="font-mono text-[10px] text-[#2E2E2E] hover:text-[#6B6760] transition-colors tracking-wider"
            >
              Privacidade
            </Link>
            <span className="text-[#1E1E1E]">·</span>
            {/* Atalho discreto para profissionais */}
            <Link
              href="/admin"
              className="font-mono text-[10px] text-[#2A2A2A] hover:text-[#C9A84C40] transition-colors tracking-wider"
            >
              Sou Profissional →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
