"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BecomeSupplierForm() {
  const router = useRouter();
  const [type, setType] = useState<"INDIVIDUAL" | "AGENCY">("INDIVIDUAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = { type, ...Object.fromEntries(form.entries()) };

    const res = await fetch("/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard/cars/new");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div>
        <span className="label">I am a…</span>
        <div className="grid grid-cols-2 gap-3">
          {(["INDIVIDUAL", "AGENCY"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                type === t
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {t === "INDIVIDUAL" ? "Private owner" : "Rental agency"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="businessName">
          {type === "AGENCY" ? "Agency name" : "Display name"}
        </label>
        <input id="businessName" name="businessName" className="input" required />
      </div>

      <div>
        <label className="label" htmlFor="location">
          Base location
        </label>
        <input
          id="location"
          name="location"
          className="input"
          placeholder="e.g. Tunis"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="bio">
          About <span className="text-gray-400">(optional)</span>
        </label>
        <textarea id="bio" name="bio" rows={3} className="input" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating…" : "Continue"}
      </button>
    </form>
  );
}
