import type { Metadata } from "next";
import { AgendamentoFlow } from "@/components/agendamento/AgendamentoFlow";

export const metadata: Metadata = {
  title: "Agendar Horário",
  description:
    "Agende seu horário na Inspire Barber Studio. Escolha o serviço, profissional, data e horário de forma rápida e fácil.",
  robots: { index: false },
};

export default function AgendarPage() {
  return <AgendamentoFlow />;
}
