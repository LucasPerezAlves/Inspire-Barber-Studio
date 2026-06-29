import { NextResponse } from "next/server";
import { COOKIE_NAME, cookieOptions } from "@/lib/auth";

/* force-dynamic impede cache do CDN na rota de logout */
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  /* maxAge: 0 + expires passado = dupla garantia de remoção do cookie
     em todos os browsers (alguns ignoram maxAge sozinho).             */
  response.cookies.set(COOKIE_NAME, "", {
    ...cookieOptions(0),
    expires: new Date(0),
  });

  return response;
}
