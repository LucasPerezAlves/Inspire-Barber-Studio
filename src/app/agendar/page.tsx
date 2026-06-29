import type { Metadata } from "next";
import { AgendamentoFlow } from "@/components/agendamento/AgendamentoFlow";

/* Garante render sob demanda no Vercel — impede que o Next.js congele
   o shell desta página em SSG durante o build, o que retornaria uma
   lista vazia de profissionais para todos os usuários em produção.   */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agendar Horário",
  description:
    "Agende seu horário na Inspire Barber Studio. Escolha o serviço, profissional, data e horário de forma rápida e fácil.",
  robots: { index: false },
};

export default function AgendarPage() {
  return <AgendamentoFlow />;
}
