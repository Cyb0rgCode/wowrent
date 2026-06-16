import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wowrent_session";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  name: string;
  role: "CLIENT" | "SUPPLIER" | "ADMIN";
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}
