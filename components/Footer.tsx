"use client";

import { useI18n } from "@/lib/i18n/client";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} wowRent — {t.footer.rights}
        </p>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <p>{t.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
