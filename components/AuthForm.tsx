"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { t } = useI18n();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t.auth.somethingWrong);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label className="label" htmlFor="name">
            {t.auth.fullName}
          </label>
          <input id="name" name="name" className="input" required />
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input"
          required
        />
      </div>

      {mode === "register" && (
        <div>
          <label className="label" htmlFor="phone">
            {t.auth.phone}{" "}
            <span className="text-gray-400">{t.auth.optional}</span>
          </label>
          <input id="phone" name="phone" className="input" />
        </div>
      )}

      <div>
        <label className="label" htmlFor="password">
          {t.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input"
          required
          minLength={mode === "register" ? 6 : undefined}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading
          ? t.auth.pleaseWait
          : mode === "login"
            ? t.auth.login
            : t.auth.createAccount}
      </button>

      <p className="text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            {t.auth.newToWowrent}{" "}
            <Link href="/register" className="font-medium text-brand-600">
              {t.auth.createOne}
            </Link>
          </>
        ) : (
          <>
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="font-medium text-brand-600">
              {t.auth.login}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
