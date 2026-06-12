import { AdminPanel } from "./panel";

interface Props {
  params: Promise<{ barbeiro: string }>;
}

export default async function AdminBarbeiroPage({ params }: Props) {
  const { barbeiro } = await params;
  return <AdminPanel slug={barbeiro} />;
}
