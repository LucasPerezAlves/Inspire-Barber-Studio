"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UserRound, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/barbeiros-fotos`;

function getFotoSrc(foto: string | null): string | null {
  if (!foto || !SUPABASE_URL) return null;
  if (foto.startsWith("https://") || foto.startsWith("http://")) return foto;
  if (foto.startsWith("barbeiros-fotos/")) {
    return `${SUPABASE_URL}/storage/v1/object/public/${foto}`;
  }
  return `${STORAGE_BASE}/${foto}`;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  foto: string | null;
}

const QUALQUER: Profissional = {
  id: "qualquer",
  nome: "Qualquer Profissional",
  especialidade: "Próximo disponível",
  foto: null,
};

interface EtapaProfissionalProps {
  profissionalId: string;
  onSelecionar: (id: string) => void;
}

export function EtapaProfissional({ profissionalId, onSelecionar }: EtapaProfissionalProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([QUALQUER]);
  const [carregando,    setCarregando]    = useState(true);
  const [erro,          setErro]          = useState<string | null>(null);
  const [tentativas,    setTentativas]    = useState(0);

  const fetchProfissionais = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    if (!supabaseConfigurado()) {
      console.error("[EtapaProfissional] Supabase não configurado — verifique .env.local");
      setErro("Configuração incompleta. Contate o suporte.");
      setCarregando(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profissionais")
        .select("slug, nome, especialidade, foto_url")
        .order("nome", { ascending: true });

      if (error) {
        console.error("[EtapaProfissional] Erro Supabase:", error.code, error.message);
        setErro("Não foi possível carregar os profissionais.");
        return;
      }

      const lista: Profissional[] = (data ?? []).map((p) => ({
        id:            p.slug,
        nome:          p.nome,
        especialidade: p.especialidade ?? "Barbeiro",
        foto:          p.foto_url ?? null,
      }));

      setProfissionais([QUALQUER, ...lista]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[EtapaProfissional] Erro de rede:", msg);
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
        setErro("Sem conexão com o servidor. Verifique sua internet e tente novamente.");
      } else {
        setErro("Erro inesperado ao carregar profissionais.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais, tentativas]);

  const handleRetry = () => setTentativas((n) => n + 1);

  /* ── Conteúdo principal ─────────────────────────────────────────── */
  const conteudo = () => {
    if (carregando) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] overflow-hidden animate-pulse"
            >
              <div className="w-full h-44 sm:h-52 bg-[#1A1A1A]" />
              <div className="px-4 py-3 space-y-2">
                <div className="h-3 bg-[#1A1A1A] rounded w-3/4" />
                <div className="h-2 bg-[#1A1A1A] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (erro) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 gap-4 text-center"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <WifiOff className="w-5 h-5 text-[#6B6760]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-[#A8A49E] leading-relaxed">{erro}</p>
            <p className="text-[11px] text-[#3A3A3A] mt-1">
              Você ainda pode continuar com &quot;Qualquer Profissional&quot;
            </p>
          </div>
          <button
            onClick={handleRetry}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "border border-[#2A2A2A] text-[#6B6760]",
              "text-[11px] font-semibold tracking-wider uppercase",
              "hover:border-[#C9A84C40] hover:text-[#C9A84C]",
              "transition-all duration-200"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
            Tentar novamente
          </button>

          <div className="w-full mt-2">
            <BarberCard
              profissional={QUALQUER}
              selecionado={profissionalId === QUALQUER.id}
              onSelecionar={onSelecionar}
              delay={0}
            />
          </div>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {profissionais.map((prof, i) => (
          <BarberCard
            key={prof.id}
            profissional={prof}
            selecionado={profissionalId === prof.id}
            onSelecionar={onSelecionar}
            delay={i * 0.07}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="pt-2 pb-10">
      <div className="py-5 border-b border-[#1A1A1A] mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F0EDE8]">
              Escolha o profissional
            </h2>
            <p className="text-[#6B6760] text-xs mt-0.5">
              Toque em um card para avançar automaticamente
            </p>
          </div>
          {carregando && tentativas > 0 && (
            <Loader2 className="w-4 h-4 text-[#C9A84C] animate-spin shrink-0" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {conteudo()}

      {!erro && (
        <p className="text-center text-[10px] text-[#3A3A3A] mt-8 tracking-wider uppercase">
          A seleção avança automaticamente
        </p>
      )}
    </div>
  );
}

/* ─── Card do barbeiro ─────────────────────────────────────────── */
function BarberCard({
  profissional,
  selecionado,
  onSelecionar,
  delay,
}: {
  profissional: Profissional;
  selecionado: boolean;
  onSelecionar: (id: string) => void;
  delay: number;
}) {
  const [imgError, setImgError] = useState(false);

  const isQualquer = profissional.id === "qualquer";
  const fotoSrc    = getFotoSrc(profissional.foto);
  const mostraFoto = !isQualquer && fotoSrc !== null && !imgError;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelecionar(profissional.id)}
      className={cn(
        "group w-full overflow-hidden rounded-xl backdrop-blur-sm",
        "flex flex-row items-center gap-4 p-4",
        "sm:flex-col sm:gap-0 sm:p-0 sm:text-center",
        "border transition-all duration-300",
        selecionado
          ? "border-[#C9A84C60] bg-[#C9A84C06] shadow-[0_0_24px_#C9A84C20]"
          : "border-[#1E1E1E] bg-[#0F0F0F]/80 hover:border-[#C9A84C30] hover:bg-[#131313]/80"
      )}
    >
      {/* Foto / ícone ─────────────────────────────────────────────
          Mobile  : 80×80 px fixo, com ring de seleção
          Desktop : largura total, altura fixa sm:h-52 (208 px) em
                    TODOS os cards — garante linhas uniformes no grid
                    independente de quantas linhas de texto há abaixo.
      ──────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          "w-20 h-20 rounded-lg sm:rounded-none",
          selecionado && "ring-2 ring-[#C9A84C60] ring-offset-2 ring-offset-[#0B0B0B] sm:ring-0 sm:ring-offset-0",
          "sm:w-full sm:h-52",
        )}
      >
        {mostraFoto ? (
          <Image
            src={fotoSrc}
            alt={profissional.nome}
            fill
            sizes="(max-width: 640px) 80px, 300px"
            className="object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center">
            <UserRound
              className={cn(
                "w-1/3 h-1/3 transition-colors duration-300",
                selecionado ? "text-[#C9A84C]" : "text-[#2A2A2A] group-hover:text-[#3A3A3A]"
              )}
              strokeWidth={1}
            />
          </div>
        )}

        {selecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#C9A84C08]"
          />
        )}
      </div>

      {/* Texto — padding próprio no desktop */}
      <div className="flex-1 sm:flex-none sm:w-full sm:px-4 sm:py-3">
        <p
          className={cn(
            "text-sm font-semibold leading-tight transition-colors duration-300",
            selecionado ? "text-[#C9A84C]" : "text-[#F0EDE8] group-hover:text-[#E6C97A]"
          )}
        >
          {profissional.nome}
        </p>
        <p className="text-[10px] text-[#6B6760] mt-0.5">
          {profissional.especialidade}
        </p>
      </div>
    </motion.button>
  );
}
