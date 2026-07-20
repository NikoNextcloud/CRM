import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { crmPassword, expectedToken, isAuthEnabled, isAuthenticated, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authEnabled: isAuthEnabled(), authed });
}

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ authed: true, authEnabled: false });
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const password = String(body.password || "");

  if (!password || password !== crmPassword()) {
    return NextResponse.json({ error: "Грешна парола. Опитай отново." }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ authed: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ authed: false });
}
