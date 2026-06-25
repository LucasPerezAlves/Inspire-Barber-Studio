/* Server Component — animação via CSS puro, sem JS no cliente */

const BRANDS = [
  "REUZEL",
  "UPPERCUT DELUXE",
  "WAHL",
  "ANDIS",
  "AMERICAN CREW",
  "PRAMIC",
  "INSPIRE STUDIO",
  "SCHWARZKOPF",
  "BIGEN",
  "MORGAN'S POMADE",
] as const;

export function BrandTicker() {
  /* Duplicamos a lista para criar o loop contínuo sem salto */
  const items = [...BRANDS, ...BRANDS];

  return (
    <div className="relative overflow-hidden bg-[#080808] border-y border-[#161616] py-[18px]">
      {/* Fade nas bordas */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />

      {/* Track animado */}
      <div
        className="animate-ticker flex whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((brand, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-7 sm:gap-10 font-mono text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-[#282828] select-none"
          >
            {brand}
            <span className="text-[#C9A84C28] text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
