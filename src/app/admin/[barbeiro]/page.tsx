import { cookies } from "next/headers";
import { AdminPanel } from "./panel";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ barbeiro: string }>;
}

export default async function AdminBarbeiroPage({ params }: Props) {
  const { barbeiro } = await params;

  /* O middleware já garantiu que o token é válido ao chegar aqui.
     Lemos a role para passar ao client component sem expor o JWT. */
  const cookieStore = await cookies();
  const token       = cookieStore.get(COOKIE_NAME)?.value;
  const payload     = token ? await verifyAdminToken(token) : null;
  const role        = (payload?.role ?? "BARBER") as "OWNER" | "BARBER";

  return <AdminPanel slug={barbeiro} role={role} />;
}
