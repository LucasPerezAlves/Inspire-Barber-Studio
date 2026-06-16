import Image from "next/image";
import { cn } from "@/lib/utils";
import { Instagram, Scissors } from "lucide-react";
import Link from "next/link";

const TEAM = [
  {
    name: "Pablo de Oliveira",
    role: "Sócio-Fundador & Barbeiro",
    specialty: "Corte Degradê · Fade · Estilo Moderno",
    foto: "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2FgJImKl5pipbmAT8l7eF0RRAB1Ic2.jpeg?alt=media&token=501a651f-9fa4-4795-9f98-8a972bb4a32e",
    instagram: "https://www.instagram.com/pablodabarbearia/",
    instagramHandle: "@pablodabarbearia",
  },
  {
    name: "Altamiro Peixer",
    role: "Barbeiro Especialista",
    specialty: "Barba · Navalha · Transformações",
    foto: "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2F5TZOPLMrnfZ4mEaAAHeu4XmsytK2.jpeg?alt=media&token=696818be-fc46-4680-8819-d8d206fe85ed",
    instagram: "https://www.instagram.com/altamiropeixer/",
    instagramHandle: "@altamiropeixer",
  },
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

export function TeamSection() {
  return (
    <section id="equipe" className="relative bg-[#0B0B0B] py-24 lg:py-32 overflow-hidden">
      <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-[#C9A84C] opacity-[0.03] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16">
          <div>
            <SectionLabel>A Equipe</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#F0EDE8] mt-4">
              Nossos{" "}
              <span className="text-gradient-gold font-semibold italic">
                Artistas
              </span>
            </h2>
          </div>
          <p className="text-[#6B6760] text-sm leading-relaxed max-w-xs">
            Profissionais apaixonados pela arte da barbearia, com olhar apurado
            e dedicação em cada detalhe.
          </p>
        </div>

        {/* Cards — centralizados pois são apenas 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {TEAM.map((member) => (
            <BarberCard key={member.name} member={member} />
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-14 text-center">
          <p className="text-[#6B6760] text-sm">
            Profissionais certificados e em constante especialização.
          </p>
          <div className="divider-gold mt-8 max-w-xs mx-auto" />
        </div>
      </div>
    </section>
  );
}

/* ── Card do barbeiro ───────────────────────────────────────────── */
function BarberCard({ member }: { member: (typeof TEAM)[number] }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col",
        "bg-[#111111] border border-[#1E1E1E]",
        "hover:border-[#C9A84C25] hover:shadow-[0_8px_40px_0_#00000060]",
        "hover:-translate-y-1 transition-all duration-400 ease-out"
      )}
    >
      {/* Foto real */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0D0D0D]">
        <Image
          src={member.foto}
          alt={member.name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 90vw, 400px"
        />

        {/* Gradiente de fade na base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

        {/* Badge de barbeiro */}
        <div
          className={cn(
            "absolute top-4 left-4",
            "inline-flex items-center gap-1.5",
            "text-[9px] font-bold tracking-[0.2em] uppercase",
            "text-[#C9A84C] border border-[#C9A84C30] bg-[#0B0B0B80]",
            "backdrop-blur-sm px-2.5 py-1"
          )}
        >
          <Scissors className="w-2.5 h-2.5" strokeWidth={2} />
          Barbeiro
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl font-semibold text-[#F0EDE8] group-hover:text-[#E6C97A] transition-colors duration-300">
          {member.name}
        </h3>

        <p className="text-[#C9A84C] text-xs font-semibold tracking-wider uppercase mt-1 mb-2">
          {member.role}
        </p>

        <p className="text-[#6B6760] text-xs leading-relaxed group-hover:text-[#A8A49E] transition-colors duration-300 flex-1">
          {member.specialty}
        </p>

        {/* Instagram */}
        <div className="mt-5 pt-4 border-t border-[#1E1E1E] group-hover:border-[#C9A84C15] transition-colors duration-300">
          <Link
            href={member.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram de ${member.name}`}
            className={cn(
              "inline-flex items-center gap-2",
              "text-[10px] font-medium tracking-wider uppercase",
              "text-[#6B6760] hover:text-[#C9A84C] transition-colors duration-200"
            )}
          >
            <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
            {member.instagramHandle}
          </Link>
        </div>
      </div>
    </article>
  );
}
