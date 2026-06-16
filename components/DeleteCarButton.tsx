"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Remove this car? Bookings will keep it hidden instead.")) {
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
      {busy ? "…" : "Delete"}
    </button>
  );
}
