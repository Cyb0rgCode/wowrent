"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function ContactOwnerButton({
  carId,
  supplierId,
  isLoggedIn,
}: {
  carId: string;
  supplierId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleContact() {
    if (!isLoggedIn) {
      router.push(`/login?next=/cars/${carId}`);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, supplierId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push(`/messages/${data.id}`);
    }
  }

  return (
    <button onClick={handleContact} disabled={loading} className="btn-secondary">
      {loading ? "…" : t.contact.message}
    </button>
  );
}
