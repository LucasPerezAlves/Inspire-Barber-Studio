import Image from "next/image";

/* ── Tipos ──────────────────────────────────────────────────────────
   Union discriminada: paths são constantes de compilação → sem risco
   de Path Traversal. Erros de carregamento ficam contidos no card.
─────────────────────────────────────────────────────────────────── */
type GalleryItem =
  | { type: "image"; src: string; alt: string; label: string; pos: string }
  | { type: "video"; src: string; alt: string; label: string };

/* ── Catálogo de mídia ──────────────────────────────────────────────
   Vídeos em /public/images com nomes limpos (sem emojis/hashtags).
   Alternância image / video cria ritmo visual natural no grid.
─────────────────────────────────────────────────────────────────── */
const MEDIA: GalleryItem[] = [
  {
    type:  "image",
    src:   "/images/internaBarbearia.jpg",
    alt:   "Ambiente interno da Inspire Barber Studio",
    label: "AMBIENTE",
    pos:   "50% 30%",
  },
  {
    type:  "video",
    src:   "/images/video-high-fade.mp4",
    alt:   "High fade — corte em transição",
    label: "HIGH FADE",
  },
  {
    type:  "image",
    src:   "/images/frenteInspire.jpg",
    alt:   "Fachada da Inspire Barber Studio",
    label: "ESPAÇO",
    pos:   "50% 50%",
  },
  {
    type:  "video",
    src:   "/images/video-corte-social.mp4",
    alt:   "Corte social — pegada elegante",
    label: "ESTILO",
  },
  {
    type:  "image",
    src:   "/images/cabelo1.jpg",
    alt:   "Corte finalizado — detalhe técnico",
    label: "EXECUÇÃO",
    pos:   "50% 15%",
  },
  {
    type:  "video",
    src:   "/images/video-dia-a-dia.mp4",
    alt:   "Bastidores do dia a dia na barbearia",
    label: "BASTIDORES",
  },
];

/* ── Card de mídia ──────────────────────────────────────────────────
   aspect-square → proporção idêntica para todos os itens (mosaico
   simétrico). overflow-hidden + rounded-xl cortam conteúdo com borda
   elegante. border-neutral-900 dá separação sutil sobre bg escuro.

   Hover unificado (imagens e vídeos):
     · escala levíssima (scale-[1.02]) no wrapper
     · border clareia de neutral-900 → neutral-700
   Isso encoraja o toque no celular de forma natural.

   Vídeos recebem gradiente no TOPO (não no rodapé, que seria coberto
   pelos controles nativos) + label posicionada ali.
─────────────────────────────────────────────────────────────────── */
function MediaCard({ item }: { item: GalleryItem }) {
  return (
    <div
      className={[
        /* Proporção e corte */
        "relative aspect-square overflow-hidden",
        /* Estética premium */
        "rounded-xl border border-neutral-900 bg-neutral-950",
        /* Hover: bordas destacadas + levíssima escala */
        "group transition-all duration-300",
        "hover:border-neutral-700 hover:scale-[1.02]",
        /* Garante que a escala não vaze no layout */
        "transform-gpu",
      ].join(" ")}
    >
      {item.type === "video" ? (
        <>
          {/* ── Vídeo ─────────────────────────────────────────────
              playsInline → iOS reproduz inline (não abre fullscreen)
              preload="metadata" → baixa só o cabeçalho no page load;
                conteúdo completo vem ao pressionar play
              controls → barra nativa de play/pause/progresso
              object-cover → vídeo 16:9 ou 9:16 cabe no quadrado
          ──────────────────────────────────────────────────────── */}
          <video
            src={item.src}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            aria-label={item.alt}
          />

          {/* Gradiente no TOPO — não conflita com controles nativos
              que aparecem na base do vídeo                         */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <span className="absolute top-3 left-4 font-mono text-[9px] tracking-[0.35em] uppercase text-white/50 pointer-events-none">
            {item.label}
          </span>
        </>
      ) : (
        <>
          {/* ── Imagem ────────────────────────────────────────────
              fill + object-cover → preenche o quadrado sem distorção,
              independente das dimensões originais (portrait ou landscape)
              sizes cobre mobile carousel (82vw) e grid md (33vw)
          ──────────────────────────────────────────────────────── */}
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 767px) 82vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: item.pos }}
          />

          {/* Gradiente + label no rodapé (área livre de controles) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-4 font-mono text-[9px] tracking-[0.35em] uppercase text-white/50 pointer-events-none">
            {item.label}
          </span>
        </>
      )}
    </div>
  );
}

/* ── Seção principal ─────────────────────────────────────────────── */
export function GallerySection() {
  return (
    <section
      id="galeria"
      className="relative bg-[#0B0B0B] py-24 lg:py-32 overflow-hidden"
    >
      {/* Acento de fundo */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#C9A84C] opacity-[0.015] blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* ── Header assimétrico ────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12 px-6 lg:px-10">
          <div>
            <span className="block font-mono text-[10px] tracking-[0.42em] uppercase text-[#C9A84C] mb-4">
              04 — Galeria
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-[#F0EDE8] leading-[0.92]">
              Nosso<br />
              <span className="font-semibold italic text-gradient-gold">trabalho</span>
            </h2>
          </div>
          <p className="font-mono text-[11px] text-[#6B6760] leading-relaxed tracking-wide max-w-[220px] px-6 lg:px-0">
            Fotos e vídeos reais do espaço e dos nossos trabalhos. Arraste para ver mais.
          </p>
        </div>

        {/* ── MOBILE: carrossel snap horizontal (< md) ──────────────
            82vw por card → próximo item vaza ~18vw, sinalizando
            que há mais conteúdo sem precisar de dots ou JS.
        ────────────────────────────────────────────────────────── */}
        <div className="md:hidden overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth px-6">
          <div className="flex gap-4 pb-2 pr-6">
            {MEDIA.map((item) => (
              <div key={item.src} className="snap-center flex-none w-[82vw]">
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP: grid 3 colunas (≥ md / 768px) ───────────────
            gap-6 = 24px → respiração elegante entre os cards.
            Cada card tem aspect-square próprio, sem altura forçada
            no grid pai → proporções preservadas em qualquer viewport.
        ────────────────────────────────────────────────────────── */}
        <div className="hidden md:grid grid-cols-3 gap-6 px-6 lg:px-10">
          {MEDIA.map((item) => (
            <MediaCard key={item.src} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
