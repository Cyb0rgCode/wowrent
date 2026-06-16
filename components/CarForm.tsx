"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CarValues = {
  id?: string;
  title: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  pricePerDay: number;
  location: string;
  description: string;
  photos: string[];
  status: string;
};

const EMPTY: CarValues = {
  title: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  category: "ECONOMY",
  transmission: "MANUAL",
  fuel: "GASOLINE",
  seats: 5,
  pricePerDay: 80,
  location: "",
  description: "",
  photos: [],
  status: "ACTIVE",
};

export function CarForm({ initial }: { initial?: CarValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [v, setV] = useState<CarValues>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CarValues>(key: K, value: CarValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    set("photos", [...v.photos, ...data.urls]);
  }

  function removePhoto(url: string) {
    set(
      "photos",
      v.photos.filter((p) => p !== url),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...v,
      year: Number(v.year),
      seats: Number(v.seats),
      pricePerDay: Number(v.pricePerDay),
    };

    const res = await fetch(
      isEdit ? `/api/cars/${initial!.id}` : "/api/cars",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save car");
      return;
    }
    router.push("/dashboard/cars");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div>
        <label className="label">Listing title</label>
        <input
          className="input"
          placeholder="e.g. Volkswagen Golf 7 — Automatic"
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Make</label>
          <input
            className="input"
            value={v.make}
            onChange={(e) => set("make", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Model</label>
          <input
            className="input"
            value={v.model}
            onChange={(e) => set("model", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="label">Year</label>
          <input
            type="number"
            className="input"
            value={v.year}
            onChange={(e) => set("year", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label">Seats</label>
          <input
            type="number"
            className="input"
            value={v.seats}
            onChange={(e) => set("seats", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label">Price / day (TND)</label>
          <input
            type="number"
            step="0.1"
            className="input"
            value={v.pricePerDay}
            onChange={(e) => set("pricePerDay", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={v.location}
            onChange={(e) => set("location", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {["ECONOMY", "COMPACT", "SEDAN", "SUV", "LUXURY", "VAN", "PICKUP"].map(
              (c) => (
                <option key={c} value={c}>
                  {c[0] + c.slice(1).toLowerCase()}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="label">Gearbox</label>
          <select
            className="input"
            value={v.transmission}
            onChange={(e) => set("transmission", e.target.value)}
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
          </select>
        </div>
        <div>
          <label className="label">Fuel</label>
          <select
            className="input"
            value={v.fuel}
            onChange={(e) => set("fuel", e.target.value)}
          >
            <option value="GASOLINE">Gasoline</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={4}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Condition, mileage policy, pickup details…"
        />
      </div>

      <div>
        <label className="label">Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="block text-sm"
        />
        {uploading && (
          <p className="mt-1 text-xs text-gray-500">Uploading…</p>
        )}
        {v.photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {v.photos.map((p) => (
              <div key={p} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p}
                  alt=""
                  className="h-20 w-28 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(p)}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">Status</label>
        <select
          className="input sm:w-48"
          value={v.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="ACTIVE">Active (visible)</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/cars")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
