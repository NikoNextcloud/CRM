import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pp_session";

function sessionSecret() {
  return process.env.CRM_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "printpilot-fallback-secret";
}

export function crmPassword() {
  return process.env.CRM_PASSWORD || "";
}

export function isAuthEnabled() {
  return Boolean(crmPassword());
}

export function expectedToken() {
  return createHmac("sha256", sessionSecret()).update(`printpilot:${crmPassword()}`).digest("hex");
}

export async function isAuthenticated() {
  if (!isAuthEnabled()) return true;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return Boolean(token && token === expectedToken());
}
