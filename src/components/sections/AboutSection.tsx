import { cn } from "@/lib/utils";
import {
  Thermometer,
  Coffee,
  Crown,
  Wifi,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const DIFFERENTIALS = [
  {
    icon: Crown,
    title: "Espaço VIP",
    description:
      "Ambiente exclusivo com poltrona reservada, privacidade e atendimento personalizado para clientes premium.",
  },
  {
    icon: Coffee,
    title: "Café Especial",
    description:
      "Café fresquinho cortesia da casa durante o seu atendimento. Um detalhe simples que faz toda a diferença.",
  },
  {
    icon: Thermometer,
    title: "Ambiente Climatizado",
    description:
      "Temperatura controlada, aromas exclusivos e uma atmosfera pensada para o seu completo conforto.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi de Alta Velocidade",
    description:
      "Conexão estável e rápida para você trabalhar, assistir ou relaxar enquanto é atendido.",
  },
  {
    icon: ShieldCheck,
    title: "Produtos Premium",
    description:
      "Utilizamos apenas cosméticos e ferramentas de alta linha — Wahl, Andis, American Crew e Uppercut.",
  },
  {
    icon: Sparkles,
    title: "Higiene Certificada",
    description:
      "Materiais esterilizados, toalhas descartáveis e protocolos rigorosos de limpeza em cada atendimento.",
  },
] as const;

const STATS = [
  { value: "5.0", label: "Google Rating" },
  { value: "65+", label: "Avaliações" },
  { value: "100%", label: "Satisfação" },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C9A84C]">
      <span className="w-5 h-px bg-[#C9A84C]" />
      {children}
      <span className="w-5 h-px bg-[#C9A84C]" />
    </span>
  );
}

export function AboutSection() {
  return (
    <section id="sobre" className="relative bg-[#0F0F0F] py-24 lg:py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute right-0 bottom-0 w-[700px] h-[700px] bg-[#C9A84C] opacity-[0.025] blur-[160px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Top split: narrative + visual box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">

          {/* Left — text content */}
          <div>
            <SectionLabel>Nossa História</SectionLabel>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#F0EDE8] mt-4 leading-[1.1]">
              Mais do que um{" "}
              <span className="text-gradient-gold font-semibold italic">
                corte
              </span>
              , uma experiência
            </h2>

            <div className="mt-8 space-y-4 text-[#A8A49E] text-sm sm:text-base leading-relaxed">
              <p>
                A Inspire Barber Studio nasceu com um propósito simples: oferecer
                o melhor da barbearia premium em Blumenau. Desde o início, investimos
                em profissionais técnicos, produtos de ponta e um ambiente que
                respeita o seu tempo e o seu estilo.
              </p>
              <p>
                Localizada no coração de Itoupava Norte, nossa missão é a mesma
                a cada visita — entregar um resultado impecável e uma experiência
                que vai além do corte.
              </p>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="border border-[#1E1E1E] p-4 hover:border-[#C9A84C25] transition-colors duration-300"
                >
                  <span className="block font-display text-3xl sm:text-4xl font-semibold text-[#C9A84C]">
                    {value}
                  </span>
                  <span className="block text-[10px] text-[#6B6760] tracking-wider uppercase mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/agendar"
              className={cn(
                "mt-8 inline-flex items-center",
                "px-8 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase",
                "text-[#0B0B0B] bg-[#C9A84C]",
                "hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35]",
                "transition-all duration-300 active:scale-[0.97]"
              )}
            >
              Reserve seu horário
            </Link>
          </div>

          {/* Right — visual composition */}
          <div className="relative">
            {/* Main visual block */}
            <div
              className={cn(
                "relative w-full aspect-[4/5] max-w-sm mx-auto",
                "bg-gradient-to-br from-[#1A1A12] via-[#141410] to-[#0D0D0B]",
                "border border-[#C9A84C18]"
              )}
            >
              {/* Inner pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    #C9A84C 0px,
                    #C9A84C 1px,
                    transparent 1px,
                    transparent 12px
                  )`,
                }}
              />

              {/* Center text art */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="font-display text-[80px] sm:text-[100px] font-bold text-gradient-gold leading-none opacity-15">
                  IBS
                </span>
                <span className="font-display text-lg sm:text-xl font-medium tracking-[0.4em] uppercase text-[#C9A84C] opacity-70">
                  Inspire Barber Studio
                </span>
                <div className="divider-gold w-24 mx-auto mt-2" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#6B6760] mt-1">
                  Blumenau — SC
                </span>
              </div>

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C40]" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#C9A84C40]" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C9A84C40]" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C40]" />
            </div>

            {/* Floating accent card */}
            <div
              className={cn(
                "absolute -bottom-6 -left-6 lg:-left-10",
                "bg-[#0B0B0B] border border-[#C9A84C25]",
                "p-4 w-40 shadow-[0_8px_32px_0_#00000080]"
              )}
            >
              <span className="block font-display text-3xl font-semibold text-[#C9A84C]">
                5.0
              </span>
              <span className="block text-[9px] text-[#6B6760] tracking-wider uppercase mt-0.5">
                Avaliação Google
              </span>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[#C9A84C] text-xs">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Differentials grid */}
        <div>
          <div className="text-center mb-12">
            <SectionLabel>Por que nos escolher</SectionLabel>
            <h3 className="font-display text-3xl sm:text-4xl font-light text-[#F0EDE8] mt-4">
              A experiência que faz a diferença
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1A1A]">
            {DIFFERENTIALS.map((item) => (
              <DifferentialCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Differential card ─────────────────────────────────────────── */
function DifferentialCard({
  item,
}: {
  item: (typeof DIFFERENTIALS)[number];
}) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "group relative bg-[#0F0F0F] p-7 sm:p-8",
        "hover:bg-[#111108]",
        "transition-colors duration-300"
      )}
    >
      {/* Top border accent on hover */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent",
          "scale-x-0 group-hover:scale-x-100 origin-center",
          "transition-transform duration-400 ease-out"
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "inline-flex items-center justify-center w-10 h-10 mb-4",
          "border border-[#2A2A2A] bg-[#1A1A1A]",
          "group-hover:border-[#C9A84C30] group-hover:bg-[#C9A84C08]",
          "transition-all duration-300"
        )}
      >
        <Icon
          className="w-4.5 h-4.5 text-[#6B6760] group-hover:text-[#C9A84C] transition-colors duration-300"
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <h4 className="font-display text-lg font-semibold text-[#F0EDE8] group-hover:text-[#E6C97A] transition-colors duration-300 mb-2">
        {item.title}
      </h4>
      <p className="text-[#6B6760] text-sm leading-relaxed group-hover:text-[#A8A49E] transition-colors duration-300">
        {item.description}
      </p>
    </div>
  );
}
