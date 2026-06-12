import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCHEDULE = [
  { days: "Terça — Sexta", hours: "09:00 — 20:00" },
  { days: "Sábado", hours: "09:00 — 20:00" },
  { days: "Domingo & Segunda", hours: "Fechado" },
] as const;

const SERVICES = [
  "Corte Clássico",
  "Degradê & Fade",
  "Barba Completa",
  "Barba Design",
  "Tratamentos Capilares",
  "Sobrancelha",
] as const;

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/inspire.barberstudio/",
    icon: Instagram,
  },
] as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold tracking-widest uppercase",
        "text-[#F0EDE8] mb-5",
        "after:block after:mt-2 after:w-8 after:h-px after:bg-[#C9A84C]"
      )}
    >
      {children}
    </h3>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0D0D0D] border-t border-[#1E1E1E]">
      {/* Gold divider line */}
      <div className="divider-gold" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand column */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
            <span
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-sm",
                "border border-[#C9A84C40] bg-[#C9A84C10]",
                "transition-all duration-300 group-hover:border-[#C9A84C70]"
              )}
            >
              <Scissors className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
            </span>
            <span className="font-display text-xl font-semibold tracking-widest uppercase text-[#F0EDE8]">
              Inspire <span className="text-[#C9A84C]">Barber Studio</span>
            </span>
          </Link>

          <p className="text-[#6B6760] text-sm leading-relaxed mb-6 max-w-[240px]">
            Barbearia premium em Blumenau — SC. Qualidade, precisão e estilo em cada atendimento.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-sm",
                  "border border-[#2A2A2A] text-[#6B6760]",
                  "hover:border-[#C9A84C60] hover:text-[#C9A84C] hover:bg-[#C9A84C08]",
                  "transition-all duration-200"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <FooterHeading>Serviços</FooterHeading>
          <ul className="flex flex-col gap-2.5">
            {SERVICES.map((service) => (
              <li key={service}>
                <Link
                  href="#servicos"
                  className={cn(
                    "text-sm text-[#6B6760] hover:text-[#C9A84C]",
                    "transition-colors duration-200",
                    "flex items-center gap-2",
                    "before:content-[''] before:block before:w-1 before:h-px before:bg-[#C9A84C40]"
                  )}
                >
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hours */}
        <div>
          <FooterHeading>Horários</FooterHeading>
          <ul className="flex flex-col gap-4">
            {SCHEDULE.map(({ days, hours }) => (
              <li key={days} className="flex flex-col gap-0.5">
                <span className="text-[#A8A49E] text-xs font-medium tracking-wider uppercase">
                  {days}
                </span>
                {hours === "Fechado" ? (
                  <span className="text-sm text-[#6B6760] italic">{hours}</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-[#F0EDE8]">
                    <Clock className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
                    {hours}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <FooterHeading>Contato</FooterHeading>
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="https://maps.app.goo.gl/inspire-barber-studio-blumenau"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 text-sm text-[#6B6760] hover:text-[#A8A49E] transition-colors group"
              >
                <MapPin
                  className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A84C] group-hover:text-[#E6C97A] transition-colors"
                  strokeWidth={1.5}
                />
                <span>
                  R. 9 de Agosto, 125
                  <br />
                  Itoupava Norte — Blumenau, SC
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="tel:+5547991011904"
                className="flex items-center gap-3 text-sm text-[#6B6760] hover:text-[#A8A49E] transition-colors group"
              >
                <Phone
                  className="w-4 h-4 shrink-0 text-[#C9A84C] group-hover:text-[#E6C97A] transition-colors"
                  strokeWidth={1.5}
                />
                (47) 99101-1904
              </Link>
            </li>

            <li>
              <Link
                href="mailto:contato@inspirebarberstudio.com.br"
                className="flex items-center gap-3 text-sm text-[#6B6760] hover:text-[#A8A49E] transition-colors group"
              >
                <Mail
                  className="w-4 h-4 shrink-0 text-[#C9A84C] group-hover:text-[#E6C97A] transition-colors"
                  strokeWidth={1.5}
                />
                contato@inspirebarberstudio.com.br
              </Link>
            </li>
          </ul>

          {/* CTA Agendamento */}
          <Link
            href="/agendar"
            className={cn(
              "mt-8 flex items-center justify-center w-full py-3",
              "text-sm font-semibold tracking-[0.12em] uppercase",
              "text-[#0B0B0B] bg-[#C9A84C]",
              "hover:bg-[#E6C97A] hover:shadow-[0_0_20px_0_#C9A84C30]",
              "transition-all duration-300 active:scale-[0.97]"
            )}
          >
            Agendar Agora
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6760]">
          <span>
            &copy; {currentYear} Inspire Barber Studio — Blumenau, SC. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-[#A8A49E] transition-colors">
              Política de Privacidade
            </Link>
            <Link href="#" className="hover:text-[#A8A49E] transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
