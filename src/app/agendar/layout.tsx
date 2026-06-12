import type { ReactNode } from "react";
import "../globals.css";

/**
 * Layout isolado para o fluxo de agendamento.
 * Remove Navbar e Footer do root layout para criar
 * uma experiência imersiva e focada no agendamento.
 */
export default function AgendarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
