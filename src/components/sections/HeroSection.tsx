import Link from "next/link";
import { ArrowDown, CalendarDays, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* ── Backgrounds ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0B] via-[#0F0F0F] to-[#151510]" />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_20%,#0B0B0B_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#C9A84C] opacity-[0.055] blur-[160px] pointer-events-none" />

      {/* ── Zona 1: conteúdo principal — ocupa o espaço disponível ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pt-28 pb-8">
        <div className="text-center max-w-5xl mx-auto w-full">

          {/* Badge */}
          <div className="flex items-center justify-center mb-8">
            <span
              className={cn(
                "inline-flex items-center gap-2.5",
                "text-[10px] sm:text-xs font-semibold tracking-[0.35em] uppercase",
                "text-[#C9A84C] border border-[#C9A84C28] bg-[#C9A84C08]",
                "px-5 py-2.5"
              )}
            >
              <Scissors className="w-3 h-3" strokeWidth={1.5} />
              Barbearia Premium — Blumenau, SC
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-light leading-[1.05] mb-6">
            <span className="block text-[#F0EDE8] text-5xl sm:text-7xl lg:text-8xl xl:text-9xl">
              Arte.
            </span>
            <span className="block text-gradient-gold text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-semibold italic">
              Precisão.
            </span>
            <span className="block text-[#F0EDE8] text-5xl sm:text-7xl lg:text-8xl xl:text-9xl">
              Estilo.
            </span>
          </h1>

          {/* Ornamento */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C60]" />
            <Scissors className="w-4 h-4 text-[#C9A84C] rotate-[-45deg]" strokeWidth={1} />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C60]" />
          </div>

          {/* Subtítulo */}
          <p className="text-[#A8A49E] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Cada detalhe é pensado para você. Do corte à barba, do produto
            ao ambiente — uma experiência que vai além do óbvio.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/agendar"
              className={cn(
                "inline-flex items-center gap-3",
                "px-8 py-4 text-sm font-semibold tracking-[0.2em] uppercase",
                "text-[#0B0B0B] bg-[#C9A84C]",
                "hover:bg-[#E6C97A] hover:shadow-[0_0_40px_0_#C9A84C45]",
                "transition-all duration-300 active:scale-[0.97]"
              )}
            >
              <CalendarDays className="w-4 h-4" strokeWidth={2} />
              Agendar Horário
            </Link>

            <Link
              href="#servicos"
              className={cn(
                "inline-flex items-center",
                "px-8 py-4 text-sm font-semibold tracking-[0.2em] uppercase",
                "text-[#A8A49E] border border-[#2A2A2A]",
                "hover:border-[#C9A84C40] hover:text-[#F0EDE8] hover:bg-[#C9A84C06]",
                "transition-all duration-300"
              )}
            >
              Ver Serviços
            </Link>
          </div>
        </div>
      </div>

      {/* ── Zona 2: stats strip — ancorada ao fundo do flex ──────── */}
      <div className="relative z-10 pb-16 pt-4 px-6">
        <div className="divider-gold max-w-sm mx-auto mb-8 opacity-40" />
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
          {[
            { value: "5.0 ★", label: "Avaliação Google" },
            { value: "65+",   label: "Avaliações" },
            { value: "100%",  label: "Satisfação" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <span className="block font-display text-2xl sm:text-3xl text-[#C9A84C] font-semibold">
                {value}
              </span>
              <span className="block text-[10px] sm:text-xs text-[#6B6760] tracking-wider uppercase mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-[#6B6760]">
        <Link
          href="#servicos"
          aria-label="Ir para serviços"
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="relative w-px h-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C80] to-transparent animate-[slideDown_1.8s_ease-in-out_infinite]" />
          </div>
          <ArrowDown
            className="w-3 h-3 group-hover:text-[#C9A84C] transition-colors animate-bounce"
            strokeWidth={1.5}
          />
        </Link>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-[#C9A84C20]" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-[#C9A84C20]" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-[#C9A84C20]" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-[#C9A84C20]" />
    </section>
  );
}
