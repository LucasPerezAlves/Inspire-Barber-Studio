/**
 * POST /api/cliente/logout
 *
 * Remove o cookie HttpOnly de sessão do cliente.
 * maxAge:0 + expires passado = dupla garantia de remoção em todos browsers.
 */
import { NextResponse } from "next/server";
import { cookieOptionsCliente, COOKIE_CLIENTE } from "@/lib/auth-cliente";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_CLIENTE, "", {
    ...cookieOptionsCliente(0),
    expires: new Date(0),
  });
  return response;
}
