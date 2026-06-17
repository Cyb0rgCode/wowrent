"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [v, setV] = useState<CarValues>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

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
      setError(data.error ?? t.carForm.uploadFailed);
      return;
    }
    set("photos", [...v.photos, ...data.urls]);
  }

  function addPhotoUrl() {
    const url = photoUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError(t.carForm.invalidUrl);
      return;
    }
    if (!v.photos.includes(url)) set("photos", [...v.photos, url]);
    setPhotoUrl("");
    setError(null);
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
      setError(data.error ?? t.carForm.couldNotSave);
      return;
    }
    router.push("/dashboard/cars");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div>
        <label className="label">{t.carForm.listingTitle}</label>
        <input
          className="input"
          placeholder={t.carForm.listingTitlePlaceholder}
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t.carForm.make}</label>
          <input
            className="input"
            value={v.make}
            onChange={(e) => set("make", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">{t.carForm.model}</label>
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
          <label className="label">{t.carForm.year}</label>
          <input
            type="number"
            className="input"
            value={v.year}
            onChange={(e) => set("year", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label">{t.carForm.seats}</label>
          <input
            type="number"
            className="input"
            value={v.seats}
            onChange={(e) => set("seats", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label">{t.carForm.pricePerDay}</label>
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
          <label className="label">{t.carForm.location}</label>
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
          <label className="label">{t.carForm.category}</label>
          <select
            className="input"
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {["ECONOMY", "COMPACT", "SEDAN", "SUV", "LUXURY", "VAN", "PICKUP"].map(
              (c) => (
                <option key={c} value={c}>
                  {t.labels.category[c as keyof typeof t.labels.category]}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="label">{t.carForm.gearbox}</label>
          <select
            className="input"
            value={v.transmission}
            onChange={(e) => set("transmission", e.target.value)}
          >
            <option value="MANUAL">{t.labels.transmission.MANUAL}</option>
            <option value="AUTOMATIC">{t.labels.transmission.AUTOMATIC}</option>
          </select>
        </div>
        <div>
          <label className="label">{t.carForm.fuel}</label>
          <select
            className="input"
            value={v.fuel}
            onChange={(e) => set("fuel", e.target.value)}
          >
            <option value="GASOLINE">{t.labels.fuel.GASOLINE}</option>
            <option value="DIESEL">{t.labels.fuel.DIESEL}</option>
            <option value="HYBRID">{t.labels.fuel.HYBRID}</option>
            <option value="ELECTRIC">{t.labels.fuel.ELECTRIC}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">{t.carForm.description}</label>
        <textarea
          className="input"
          rows={4}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t.carForm.descriptionPlaceholder}
        />
      </div>

      <div>
        <label className="label">{t.carForm.photos}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="block text-sm"
        />
        {uploading && (
          <p className="mt-1 text-xs text-gray-500">{t.carForm.uploading}</p>
        )}
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            className="input flex-1"
            placeholder={t.carForm.photoUrlPlaceholder}
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhotoUrl();
              }
            }}
          />
          <button type="button" onClick={addPhotoUrl} className="btn-secondary">
            {t.carForm.add}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">{t.carForm.photosNote}</p>
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
        <label className="label">{t.carForm.status}</label>
        <select
          className="input sm:w-48"
          value={v.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="ACTIVE">{t.carForm.statusActive}</option>
          <option value="HIDDEN">{t.carForm.statusHidden}</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? t.carForm.saving
            : isEdit
              ? t.carForm.saveChanges
              : t.carForm.publishListing}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/cars")}
          className="btn-secondary"
        >
          {t.carForm.cancel}
        </button>
      </div>
    </form>
  );
}
