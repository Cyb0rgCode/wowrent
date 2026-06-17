"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CarFilters } from "@/lib/cars";
import { useI18n } from "@/lib/i18n/client";

export function CarFiltersBar({ initial }: { initial: CarFilters }) {
  const router = useRouter();
  const { t } = useI18n();
  const [f, setF] = useState({
    q: initial.q ?? "",
    location: initial.location ?? "",
    category: initial.category ?? "",
    transmission: initial.transmission ?? "",
    maxPrice: initial.maxPrice?.toString() ?? "",
    seats: initial.seats?.toString() ?? "",
  });

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/cars?${params.toString()}`);
  }

  function reset() {
    setF({
      q: "",
      location: "",
      category: "",
      transmission: "",
      maxPrice: "",
      seats: "",
    });
    router.push("/cars");
  }

  return (
    <form
      onSubmit={apply}
      className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <input
        className="input col-span-2 sm:col-span-1"
        placeholder={t.filters.searchPlaceholder}
        value={f.q}
        onChange={(e) => setF({ ...f, q: e.target.value })}
      />
      <input
        className="input"
        placeholder={t.filters.location}
        value={f.location}
        onChange={(e) => setF({ ...f, location: e.target.value })}
      />
      <select
        className="input"
        value={f.category}
        onChange={(e) => setF({ ...f, category: e.target.value })}
      >
        <option value="">{t.filters.anyType}</option>
        <option value="ECONOMY">{t.labels.category.ECONOMY}</option>
        <option value="COMPACT">{t.labels.category.COMPACT}</option>
        <option value="SEDAN">{t.labels.category.SEDAN}</option>
        <option value="SUV">{t.labels.category.SUV}</option>
        <option value="LUXURY">{t.labels.category.LUXURY}</option>
        <option value="VAN">{t.labels.category.VAN}</option>
        <option value="PICKUP">{t.labels.category.PICKUP}</option>
      </select>
      <select
        className="input"
        value={f.transmission}
        onChange={(e) => setF({ ...f, transmission: e.target.value })}
      >
        <option value="">{t.filters.anyGearbox}</option>
        <option value="MANUAL">{t.labels.transmission.MANUAL}</option>
        <option value="AUTOMATIC">{t.labels.transmission.AUTOMATIC}</option>
      </select>
      <input
        className="input"
        type="number"
        min={0}
        placeholder={t.filters.maxPrice}
        value={f.maxPrice}
        onChange={(e) => setF({ ...f, maxPrice: e.target.value })}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          {t.filters.filter}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          {t.filters.reset}
        </button>
      </div>
    </form>
  );
}
