"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function DeleteCarButton({ carId }: { carId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(t.deleteCar.confirm)) {
      return;
    }
    setBusy(true);
    await fetch(`/api/cars/${carId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      className="btn-danger px-3 py-1.5 text-xs"
    >
      {busy ? "…" : t.deleteCar.delete}
    </button>
  );
}
