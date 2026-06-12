import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Inspire Barber Studio | Barbearia em Blumenau - SC",
    template: "%s | Inspire Barber Studio",
  },
  description:
    "Inspire Barber Studio — barbearia premium em Blumenau, SC. Cortes de precisão, barba navalha, ambiente climatizado e muito estilo. R. 9 de Agosto, 125 — Itoupava Norte.",
  keywords: [
    "barbearia blumenau",
    "barber studio blumenau",
    "corte masculino blumenau",
    "barba navalha blumenau",
    "inspire barber studio",
    "barbearia itoupava norte",
    "cuidados masculinos sc",
  ],
  openGraph: {
    title: "Inspire Barber Studio | Barbearia em Blumenau - SC",
    description:
      "Barbearia premium em Blumenau, SC. Cortes de precisão, barba navalha e experiência completa.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0B0B0B] text-[#F0EDE8] antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
