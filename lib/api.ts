import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "You must be logged in") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Not allowed") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Resolves the public base URL for building absolute links (e.g. payment
 * return URLs). Prefers NEXT_PUBLIC_APP_URL, then the incoming request's
 * forwarded host (works automatically on Vercel), then localhost.
 */
export function getBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

/**
 * Converts a thrown error into a JSON response, mapping Zod issues to 400.
 */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: err.issues[0]?.message ?? "Invalid input", details: err.issues },
      { status: 400 },
    );
  }
  console.error(err);
  return serverError();
}
