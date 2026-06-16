import { test } from "node:test";
import assert from "node:assert/strict";
import {
  diffInDays,
  rangesOverlap,
  quotePrice,
  round2,
} from "../lib/availability";

test("diffInDays counts whole rental days, minimum 1", () => {
  assert.equal(diffInDays(new Date("2026-06-01"), new Date("2026-06-04")), 3);
  assert.equal(diffInDays(new Date("2026-06-01"), new Date("2026-06-02")), 1);
  // same day still bills 1 day
  assert.equal(diffInDays(new Date("2026-06-01"), new Date("2026-06-01")), 1);
});

test("rangesOverlap detects only true overlaps", () => {
  const a1 = new Date("2026-06-01");
  const a2 = new Date("2026-06-05");
  // overlapping
  assert.equal(
    rangesOverlap(a1, a2, new Date("2026-06-04"), new Date("2026-06-08")),
    true,
  );
  // adjacent (one ends when the other starts) -> no overlap
  assert.equal(
    rangesOverlap(a1, a2, new Date("2026-06-05"), new Date("2026-06-09")),
    false,
  );
  // fully separate
  assert.equal(
    rangesOverlap(a1, a2, new Date("2026-06-10"), new Date("2026-06-12")),
    false,
  );
});

test("quotePrice applies commission as a service fee", () => {
  const q = quotePrice(100, new Date("2026-06-01"), new Date("2026-06-04"), 0.1);
  assert.equal(q.days, 3);
  assert.equal(q.subtotal, 300);
  assert.equal(q.serviceFee, 30);
  assert.equal(q.total, 330);
});

test("round2 rounds to two decimals", () => {
  assert.equal(round2(33.005), 33.01);
  assert.equal(round2(0.1 + 0.2), 0.3);
});
