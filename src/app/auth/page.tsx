import { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Entrar | Inspire Barber Studio",
  description: "Acesse sua conta ou crie um cadastro na Inspire Barber Studio.",
  robots: { index: false },
};

export default function AuthPage() {
  return <AuthScreen />;
}
