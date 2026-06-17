import Link from "next/link";
import { requireSupplier } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTND, formatDate, STATUS_BADGE } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Dashboard — wowRent" };

export default async function DashboardPage() {
  const user = await requireSupplier();
  const supplierId = user.supplierProfile!.id;
  const t = getDict();

  const [carCount, bookings, earnings] = await Promise.all([
    prisma.car.count({ where: { supplierId } }),
    prisma.booking.findMany({
      where: { car: { supplierId } },
      include: { car: true, client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        booking: { car: { supplierId } },
      },
      _sum: { amount: true, commission: true },
    }),
  ]);

  const gross = earnings._sum.amount ?? 0;
  const commission = earnings._sum.commission ?? 0;
  const net = gross - commission;

  const activeCount = await prisma.booking.count({
    where: { car: { supplierId }, status: "CONFIRMED" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {t.dashboard.welcome} {user.supplierProfile!.businessName}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label={t.dashboard.listedCars} value={`${carCount}`} />
        <Stat label={t.dashboard.activeBookings} value={`${activeCount}`} />
        <Stat label={t.dashboard.netEarnings} value={formatTND(net)} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.dashboard.recentBookings}</h2>
        <Link
          href="/dashboard/bookings"
          className="text-sm font-medium text-brand-600"
        >
          {t.dashboard.viewAll}
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card mt-3 p-8 text-center text-gray-500">
          {t.dashboard.noBookings}
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="card flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium">{b.car.title}</p>
                <p className="text-sm text-gray-500">
                  {b.client.name} · {formatDate(b.startDate)} →{" "}
                  {formatDate(b.endDate)}
                </p>
              </div>
              <div className="text-right">
                <span className={`badge ${STATUS_BADGE[b.status]}`}>
                  {t.labels.status[b.status as keyof typeof t.labels.status] ??
                    b.status}
                </span>
                <p className="mt-1 text-sm font-semibold">
                  {formatTND(b.total)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
