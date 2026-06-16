"use client";

import { useState } from "react";

export function PayButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/payments/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start payment");
      setLoading(false);
      return;
    }
    // Redirect to Konnect (or, in mock mode, straight to the completion page).
    window.location.href = data.payUrl;
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Redirecting…" : "Pay with Konnect"}
      </button>
    </div>
  );
}
