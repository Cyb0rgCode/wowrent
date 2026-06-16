"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CarFilters } from "@/lib/cars";

export function CarFiltersBar({ initial }: { initial: CarFilters }) {
  const router = useRouter();
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
        placeholder="Search make/model"
        value={f.q}
        onChange={(e) => setF({ ...f, q: e.target.value })}
      />
      <input
        className="input"
        placeholder="Location"
        value={f.location}
        onChange={(e) => setF({ ...f, location: e.target.value })}
      />
      <select
        className="input"
        value={f.category}
        onChange={(e) => setF({ ...f, category: e.target.value })}
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
      <select
        className="input"
        value={f.transmission}
        onChange={(e) => setF({ ...f, transmission: e.target.value })}
      >
        <option value="">Any gearbox</option>
        <option value="MANUAL">Manual</option>
        <option value="AUTOMATIC">Automatic</option>
      </select>
      <input
        className="input"
        type="number"
        min={0}
        placeholder="Max TND/day"
        value={f.maxPrice}
        onChange={(e) => setF({ ...f, maxPrice: e.target.value })}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          Filter
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          Reset
        </button>
      </div>
    </form>
  );
}
