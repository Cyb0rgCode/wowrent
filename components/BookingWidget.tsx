"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatTND } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const COMMISSION = Number(
  process.env.NEXT_PUBLIC_COMMISSION_RATE ?? "0.10",
);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingWidget({
  carId,
  pricePerDay,
  isLoggedIn,
}: {
  carId: string;
  pricePerDay: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) return null;
    const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / MS_PER_DAY));
    const subtotal = pricePerDay * days;
    const serviceFee = Math.round(subtotal * COMMISSION * 100) / 100;
    return { days, subtotal, serviceFee, total: subtotal + serviceFee };
  }, [start, end, pricePerDay]);

  async function handleBook() {
    if (!isLoggedIn) {
      router.push(`/login?next=/cars/${carId}`);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, startDate: start, endDate: end }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? t.booking.couldNotCreate);
      return;
    }
    router.push(`/bookings/${data.id}/pay`);
  }

  return (
    <div className="card p-6">
      <p className="text-xl font-bold">
        {formatTND(pricePerDay)}{" "}
        <span className="text-sm font-normal text-gray-500">
          {t.booking.perDay}
        </span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t.booking.pickup}</label>
          <input
            type="date"
            className="input"
            min={todayStr()}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="label">{t.booking.return}</label>
          <input
            type="date"
            className="input"
            min={start || todayStr()}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {quote && (
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
          <Row
            label={`${formatTND(pricePerDay)} × ${quote.days} ${
              quote.days === 1 ? t.booking.day : t.booking.days
            }`}
            value={formatTND(quote.subtotal)}
          />
          <Row label={t.booking.serviceFee} value={formatTND(quote.serviceFee)} />
          <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
            <span>{t.booking.total}</span>
            <span>{formatTND(quote.total)}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleBook}
        disabled={loading || !quote}
        className="btn-primary mt-4 w-full"
      >
        {loading
          ? t.booking.reserving
          : isLoggedIn
            ? t.booking.reservePay
            : t.booking.loginToBook}
      </button>
      <p className="mt-2 text-center text-xs text-gray-400">
        {t.booking.notCharged}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
