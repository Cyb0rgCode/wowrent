import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Sign up — wowRent" };

export default function RegisterPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">{t.auth.registerTitle}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.auth.registerSubtitle}</p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
