"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupplierBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "complete" | "cancel") {
    if (action === "cancel" && !confirm("Cancel this booking?")) return;
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  if (status === "CONFIRMED") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => act("complete")}
          disabled={busy}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          Mark completed
        </button>
        <button
          onClick={() => act("cancel")}
          disabled={busy}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <button
        onClick={() => act("cancel")}
        disabled={busy}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        Cancel
      </button>
    );
  }

  return <span className="text-xs text-gray-400">—</span>;
}
