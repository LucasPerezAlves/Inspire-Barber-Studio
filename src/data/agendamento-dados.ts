/* ─────────────────────────────────────────────────────────────────
   Inspire Barber Studio — Dados centralizados de agendamento
───────────────────────────────────────────────────────────────── */

export const BARBEARIA = {
  nome: "Inspire Barber Studio",
  logo: "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileStore%2FgJImKl5pipbmAT8l7eF0RRAB1Ic2.jpeg?alt=media&token=86c5993c-b988-46c9-b1f6-749e7ef1b83f",
  whatsapp: "5547991011904",
  endereco: "R. 9 de Agosto, 125 — Itoupava Norte, Blumenau - SC",
  instagram: "https://www.instagram.com/inspire.barberstudio/",
  horarioAbertura: 9,   // 09:00
  horarioFechamento: 20, // 20:00
  diasFuncionamento: [2, 3, 4, 5, 6] as number[], // Ter=2 Qua=3 Qui=4 Sex=5 Sáb=6
} as const;

/* ─── Serviços ────────────────────────────────────────────────── */
export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number; // em minutos
  categoria: "cabelo" | "barba" | "estetica" | "combo";
}

export const SERVICOS: Servico[] = [
  // Cabelo
  { id: "corte-degrade",    nome: "Corte Degradê",            preco: 45, duracao: 30, categoria: "cabelo" },
  { id: "corte-social",     nome: "Corte Social",             preco: 45, duracao: 30, categoria: "cabelo" },
  { id: "corte-tesoura",    nome: "Corte Todo na Tesoura",    preco: 45, duracao: 45, categoria: "cabelo" },
  // Barba
  { id: "barba-maquina",    nome: "Barba na Máquina",         preco: 40, duracao: 20, categoria: "barba" },
  { id: "barba-navalha",    nome: "Barba na Navalha",         preco: 45, duracao: 30, categoria: "barba" },
  // Estética
  { id: "sobrancelha",      nome: "Sobrancelha na Navalha",   preco: 15, duracao: 15, categoria: "estetica" },
  { id: "dep-nariz",        nome: "Depilação Nariz com Cera", preco: 15, duracao: 15, categoria: "estetica" },
  { id: "dep-orelha",       nome: "Depilação Orelha com Cera",preco: 15, duracao: 15, categoria: "estetica" },
  { id: "dep-combo",        nome: "Combo Depilação Nariz e Orelha na Cera", preco: 25, duracao: 20, categoria: "estetica" },
  // Combos
  { id: "combo-cab-sob",    nome: "Cabelo + Sobrancelha",     preco: 55, duracao: 45, categoria: "combo" },
  { id: "combo-cab-barb-m", nome: "Cabelo + Barba na Máquina",preco: 70, duracao: 50, categoria: "combo" },
  { id: "combo-cab-barb-n", nome: "Cabelo + Barba na Navalha",preco: 80, duracao: 60, categoria: "combo" },
  { id: "combo-full",       nome: "Cabelo + Barba + Sobrancelha", preco: 90, duracao: 75, categoria: "combo" },
];

/* ─── Profissionais ───────────────────────────────────────────── */
export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  foto: string | null;
}

export const PROFISSIONAIS: Profissional[] = [
  {
    id: "qualquer",
    nome: "Qualquer Profissional",
    especialidade: "Próximo disponível",
    foto: null,
  },
  {
    id: "pablo-oliveira",
    nome: "Pablo de Oliveira",
    especialidade: "Corte Degradê · Fade",
    foto: "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2FgJImKl5pipbmAT8l7eF0RRAB1Ic2.jpeg?alt=media&token=501a651f-9fa4-4795-9f98-8a972bb4a32e",
  },
  {
    id: "altamiro-peixer",
    nome: "Altamiro Peixer",
    especialidade: "Barba · Navalha",
    foto: "https://firebasestorage.googleapis.com/v0/b/marcaai-a6efb.appspot.com/o/profileBarber%2F5TZOPLMrnfZ4mEaAAHeu4XmsytK2.jpeg?alt=media&token=696818be-fc46-4680-8819-d8d206fe85ed",
  },
];

/* ─── Horários simulados ──────────────────────────────────────── */
const SLOTS_BASE = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30",
];

/** Gera horários disponíveis com padrão determinístico por data */
export function getHorariosDisponiveis(data: Date): { slot: string; disponivel: boolean }[] {
  const seed = data.getDate() * 3 + data.getMonth() * 7;
  return SLOTS_BASE.map((slot, i) => ({
    slot,
    disponivel: (i + seed) % 4 !== 0 && (i + seed + 2) % 7 !== 0,
  }));
}

/* ─── Formatação de preço ─────────────────────────────────────── */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/* ─── Formatação de duração ───────────────────────────────────── */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/* ─── Máscara de telefone ─────────────────────────────────────── */
export function mascaraTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
