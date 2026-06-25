import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection }    from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { BrandTicker }    from "@/components/sections/BrandTicker";
import { TeamSection }    from "@/components/sections/TeamSection";
import { AboutSection }   from "@/components/sections/AboutSection";

export default function Home() {
  return (
    <>
      {/* 01 — Hero cinematográfico */}
      <HeroSection />

      {/* 02 — Carrossel de serviços arrastável */}
      <ServicesSection />

      {/* Ticker de marcas — separador imersivo */}
      <BrandTicker />

      {/* 03 — Equipe com hover overlay */}
      <TeamSection />

      {/* 04 — Sobre */}
      <AboutSection />

      {/* 05 — Agendamento */}
      <section
        id="agendamento"
        className="relative bg-[#0B0B0B] py-24 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,#C9A84C06_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <span className="block font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C] mb-6">
            05 — Agendamento
          </span>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#F0EDE8] mt-2 mb-5 leading-[0.95]">
            Reserve o seu{" "}
            <span className="font-semibold italic text-gradient-gold">horário</span>
          </h2>

          <p className="font-mono text-[11px] text-[#6B6760] tracking-wide leading-relaxed mb-10 max-w-sm mx-auto">
            Escolha o serviço, o profissional e o horário. Rápido, fácil e sem sair de casa.
          </p>

          <Link
            href="/agendar"
            className="group relative inline-flex items-center gap-3 overflow-hidden px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase border border-[#C9A84C]"
          >
            <span className="absolute inset-0 bg-[#C9A84C] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 text-[#C9A84C] group-hover:text-[#0B0B0B] transition-colors duration-300">
              Agendar Online
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 text-[#C9A84C] group-hover:text-[#0B0B0B] group-hover:translate-x-1 transition-all duration-300" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </>
  );
}
