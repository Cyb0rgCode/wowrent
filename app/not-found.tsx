import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default function NotFound() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t.notFound.title}</h1>
      <p className="mt-2 text-gray-600">{t.notFound.bodyCar}</p>
      <Link href="/" className="btn-primary mt-6">
        {t.notFound.backHome}
      </Link>
    </div>
  );
}
