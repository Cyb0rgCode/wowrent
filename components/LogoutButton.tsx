"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="btn-secondary px-3 py-1.5 text-xs"
    >
      {loading ? "…" : t.nav.logout}
    </button>
  );
}
