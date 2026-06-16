"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeSearch() {
  const router = useRouter();
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
        placeholder="Where? (e.g. Tunis, Sousse)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <select
        className="input sm:w-44"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Any type</option>
        <option value="ECONOMY">Economy</option>
        <option value="COMPACT">Compact</option>
        <option value="SEDAN">Sedan</option>
        <option value="SUV">SUV</option>
        <option value="LUXURY">Luxury</option>
        <option value="VAN">Van</option>
        <option value="PICKUP">Pickup</option>
      </select>
      <button type="submit" className="btn-primary sm:w-32">
        Search
      </button>
    </form>
  );
}
