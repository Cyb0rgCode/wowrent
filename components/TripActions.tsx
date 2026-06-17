"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function TripActions({
  bookingId,
  status,
  hasReview,
  carId,
}: {
  bookingId: string;
  status: string;
  hasReview: boolean;
  carId: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [showReview, setShowReview] = useState(false);

  async function cancel() {
    if (!confirm(t.tripActions.confirmCancel)) return;
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" && (
        <Link href={`/bookings/${bookingId}/pay`} className="btn-primary px-3 py-1.5 text-xs">
          {t.tripActions.completePayment}
        </Link>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <button
          onClick={cancel}
          disabled={busy}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          {t.tripActions.cancel}
        </button>
      )}
      {status === "COMPLETED" && !hasReview && (
        <button
          onClick={() => setShowReview(true)}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          {t.tripActions.leaveReview}
        </button>
      )}
      {status === "COMPLETED" && hasReview && (
        <span className="text-xs text-gray-500">{t.tripActions.reviewed}</span>
      )}
      <Link
        href={`/cars/${carId}`}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        {t.tripActions.viewCar}
      </Link>

      {showReview && (
        <ReviewModal
          bookingId={bookingId}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}

function ReviewModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t.tripActions.couldNotSubmit);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">{t.tripActions.rateTrip}</h3>
        <div className="mt-3 flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className={i <= rating ? "text-amber-500" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="input mt-3"
          rows={4}
          placeholder={t.tripActions.reviewPlaceholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            {t.tripActions.cancel}
          </button>
          <button onClick={submit} disabled={busy} className="btn-primary">
            {busy ? t.tripActions.submitting : t.tripActions.submitReview}
          </button>
        </div>
      </div>
    </div>
  );
}
