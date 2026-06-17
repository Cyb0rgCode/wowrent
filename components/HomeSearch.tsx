"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function HomeSearch() {
  const router = useRouter();
  const { t } = useI18n();
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-xl bg-white p-3 text-gray-900 shadow-lg sm:flex-row"
    >
      <input
        className="input flex-1"
        placeholder={t.search.wherePlaceholder}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <select
        className="input sm:w-44"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">{t.search.anyType}</option>
        <option value="ECONOMY">{t.labels.category.ECONOMY}</option>
        <option value="COMPACT">{t.labels.category.COMPACT}</option>
        <option value="SEDAN">{t.labels.category.SEDAN}</option>
        <option value="SUV">{t.labels.category.SUV}</option>
        <option value="LUXURY">{t.labels.category.LUXURY}</option>
        <option value="VAN">{t.labels.category.VAN}</option>
        <option value="PICKUP">{t.labels.category.PICKUP}</option>
      </select>
      <button type="submit" className="btn-primary sm:w-32">
        {t.search.search}
      </button>
    </form>
  );
}
