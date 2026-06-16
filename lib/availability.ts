import { prisma } from "./prisma";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Number of rental days between two dates (inclusive of the start day,
 * exclusive of the end day). Always at least 1.
 */
export function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / MS_PER_DAY));
}

/**
 * Two date ranges overlap when each starts before the other ends.
 */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Returns true when the car has no PENDING/CONFIRMED booking overlapping the
 * requested window. An optional bookingId can be excluded (e.g. when editing).
 */
export async function isCarAvailable(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      carId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      // overlap: existing.start < requested.end AND requested.start < existing.end
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    select: { id: true },
  });
  return conflict === null;
}

export type PriceQuote = {
  days: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  total: number;
};

/**
 * Computes the price breakdown for a booking. The service fee is the platform
 * commission charged to the client on top of the subtotal.
 */
export function quotePrice(
  dailyRate: number,
  start: Date,
  end: Date,
  commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE ?? "0.10"),
): PriceQuote {
  const days = diffInDays(start, end);
  const subtotal = round2(dailyRate * days);
  const serviceFee = round2(subtotal * commissionRate);
  const total = round2(subtotal + serviceFee);
  return { days, dailyRate, subtotal, serviceFee, total };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
