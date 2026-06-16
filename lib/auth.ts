import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyToken, signToken, SESSION_COOKIE, type SessionPayload } from "./jwt";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Issues a signed session cookie for the given user.
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signToken(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroySession(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Reads and verifies the session cookie. Returns null when unauthenticated.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Loads the full user record for the current session, or null.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { supplierProfile: true },
  });
}

/**
 * Guard for protected pages: redirects to login when unauthenticated.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Guard for supplier-only pages: redirects suppliers without a profile to the
 * become-a-supplier onboarding flow.
 */
export async function requireSupplier() {
  const user = await requireUser();
  if (!user.supplierProfile) redirect("/dashboard/become-supplier");
  return user;
}
