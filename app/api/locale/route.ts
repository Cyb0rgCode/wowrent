import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

export async function POST(req: Request) {
  const { locale } = (await req.json()) as { locale?: string };
  if (!isLocale(locale)) {
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  }
  cookies().set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return Response.json({ ok: true });
}
