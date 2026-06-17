"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(next: Locale) {
    if (next === locale || busy) return;
    setBusy(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 text-[10px] font-semibold leading-none">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          disabled={busy}
          className={`rounded-md px-1.5 py-0.5 transition ${
            locale === l
              ? "bg-brand-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-pressed={locale === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
