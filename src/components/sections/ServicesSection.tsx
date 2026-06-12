import Link from "next/link";
import { Clock, Scissors, TrendingUp } from "lucide-react";
import { SERVICOS, type Servico, formatarPreco, formatarDuracao } from "@/data/agendamento-dados";
import { cn } from "@/lib/utils";

/* ID do serviço destacado como "mais popular" */
const FEATURED_ID = "combo-full";

const CATEGORIAS: { key: Servico["categoria"]; label: string }[] = [
  { key: "cabelo",   label: "Cabelo" },
  { key: "barba",    label: "Barba" },
  { key: "combo",    label: "Combos" },
  { key: "estetica", label: "Estética" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C9A84C]">
      <span className="w-5 h-px bg-[#C9A84C]" />
      {children}
      <span className="w-5 h-px bg-[#C9A84C]" />
    </span>
  );
}

export function ServicesSection() {
  return (
    <section id="servicos" className="relative bg-[#0D0D0D] py-24 lg:py-32 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A84C] opacity-[0.025] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel>Nossos Serviços</SectionLabel>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#F0EDE8] mt-4 mb-4">
            O que oferecemos
          </h2>
          <p className="text-[#6B6760] text-sm sm:text-base max-w-md mx-auto">
            Cada serviço executado com técnica apurada, produtos selecionados
            e toda a atenção que você merece.
          </p>
        </div>

        {/* Agrupado por categoria */}
        <div className="space-y-10">
          {CATEGORIAS.map(({ key, label }) => {
            const servicos = SERVICOS.filter((s) => s.categoria === key);
            if (servicos.length === 0) return null;
            return (
              <div key={key}>
                {/* Separador de categoria */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#6B6760]">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-[#1E1E1E]" />
                </div>

                {/* Grid de serviços */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1E1E1E]">
                  {servicos.map((s) => (
                    <ServiceCard key={s.id} servico={s} featured={s.id === FEATURED_ID} />
                  ))}
                  {/* Se quantidade ímpar, ocupa célula vazia no grid */}
                  {servicos.length % 2 !== 0 && (
                    <div className="hidden md:block bg-[#0D0D0D]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note + CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#1E1E1E] pt-8">
          <p className="text-[#6B6760] text-sm text-center sm:text-left">
            Preços sujeitos a alteração. Consulte disponibilidade.
          </p>
          <Link
            href="/agendar"
            className={cn(
              "inline-flex items-center gap-2.5",
              "px-8 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase",
              "text-[#0B0B0B] bg-[#C9A84C]",
              "hover:bg-[#E6C97A] hover:shadow-[0_0_32px_0_#C9A84C35]",
              "transition-all duration-300 active:scale-[0.97]"
            )}
          >
            <Scissors className="w-4 h-4" strokeWidth={2} />
            Agendar Agora
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Card de serviço ───────────────────────────────────────────── */
function ServiceCard({ servico, featured }: { servico: Servico; featured: boolean }) {
  return (
    <div
      className={cn(
        "relative group bg-[#0D0D0D] p-7 sm:p-8",
        "hover:bg-[#111108] transition-colors duration-300"
      )}
    >
      {/* Badge mais popular */}
      {featured && (
        <span
          className={cn(
            "absolute top-5 right-5",
            "inline-flex items-center gap-1.5",
            "text-[9px] font-bold tracking-[0.25em] uppercase",
            "text-[#0B0B0B] bg-[#C9A84C] px-2.5 py-1"
          )}
        >
          <TrendingUp className="w-2.5 h-2.5" />
          Mais popular
        </span>
      )}

      {/* Linha dourada lateral no hover */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px] bg-[#C9A84C]",
          "scale-y-0 group-hover:scale-y-100 origin-bottom",
          "transition-transform duration-300 ease-out"
        )}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Nome + duração */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-display text-xl sm:text-2xl font-medium mb-1.5",
              "text-[#F0EDE8] group-hover:text-[#E6C97A] transition-colors duration-300"
            )}
          >
            {servico.nome}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#6B6760]">
            <Clock
              className="w-3 h-3 text-[#C9A84C40] group-hover:text-[#C9A84C] transition-colors duration-300"
              strokeWidth={1.5}
            />
            {formatarDuracao(servico.duracao)}
          </span>
        </div>

        {/* Preço */}
        <span
          className={cn(
            "shrink-0 font-display text-2xl sm:text-3xl font-semibold transition-colors duration-300",
            featured ? "text-[#C9A84C]" : "text-[#A8A49E] group-hover:text-[#C9A84C]"
          )}
        >
          {formatarPreco(servico.preco)}
        </span>
      </div>
    </div>
  );
}
