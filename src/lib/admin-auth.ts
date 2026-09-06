import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "knowme_admin";

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function createAdminSessionToken(): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  return createHmac("sha256", password).update("knowme-admin-v1").digest("hex");
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = createAdminSessionToken();
  if (!expected) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}
