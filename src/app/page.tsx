import Link from "next/link";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { AboutSection } from "@/components/sections/AboutSection";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Gold section divider */}
      <div className="divider-gold" />

      <ServicesSection />

      <div className="divider-gold" />

      <TeamSection />

      <div className="divider-gold" />

      <AboutSection />

      {/* Agendamento placeholder */}
      <section
        id="agendamento"
        className="relative bg-[#0B0B0B] py-24 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,#C9A84C08_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C9A84C]">
            <span className="w-5 h-px bg-[#C9A84C]" />
            Agendamento Online
            <span className="w-5 h-px bg-[#C9A84C]" />
          </span>

          <h2 className="font-display text-4xl sm:text-5xl font-light text-[#F0EDE8] mt-4 mb-4">
            Reserve o seu horário
          </h2>

          <p className="text-[#6B6760] text-sm sm:text-base mb-10">
            Escolha o serviço, o profissional e o horário. Rápido, fácil e sem sair de casa.
          </p>

          <Link
            href="/agendar"
            className="inline-flex items-center justify-center px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-[#0B0B0B] bg-[#C9A84C] hover:bg-[#E6C97A] hover:shadow-[0_0_40px_0_#C9A84C45] transition-all duration-300 active:scale-[0.97]"
          >
            Agendar Online
          </Link>
        </div>
      </section>
    </>
  );
}
