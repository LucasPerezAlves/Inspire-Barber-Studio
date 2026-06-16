import { AdminPanel } from "./panel";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ barbeiro: string }>;
}

export default async function AdminBarbeiroPage({ params }: Props) {
  const { barbeiro } = await params;
  return <AdminPanel slug={barbeiro} />;
}
