import { NextResponse } from "next/server";
import { COOKIE_NAME, cookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  /* maxAge: 0 → browser descarta o cookie imediatamente */
  response.cookies.set(COOKIE_NAME, "", cookieOptions(0));
  return response;
}
