import { requireSupplier } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTND, formatDate, STATUS_BADGE } from "@/lib/format";
import { SupplierBookingActions } from "@/components/SupplierBookingActions";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Bookings — wowRent" };

export default async function SupplierBookingsPage() {
  const t = getDict();
  const user = await requireSupplier();
  const bookings = await prisma.booking.findMany({
    where: { car: { supplierId: user.supplierProfile!.id } },
    include: {
      car: { select: { title: true } },
      client: { select: { name: true, phone: true } },
      payment: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.dashboardBookings.title}</h1>

      {bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          {t.dashboardBookings.empty}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">
                  {t.dashboardBookings.car}
                </th>
                <th className="py-2 pr-4 font-medium">
                  {t.dashboardBookings.client}
                </th>
                <th className="py-2 pr-4 font-medium">
                  {t.dashboardBookings.dates}
                </th>
                <th className="py-2 pr-4 font-medium">
                  {t.dashboardBookings.total}
                </th>
                <th className="py-2 pr-4 font-medium">
                  {t.dashboardBookings.status}
                </th>
                <th className="py-2 font-medium">
                  {t.dashboardBookings.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">{b.car.title}</td>
                  <td className="py-3 pr-4">
                    {b.client.name}
                    {b.client.phone && (
                      <span className="block text-xs text-gray-400">
                        {b.client.phone}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </td>
                  <td className="py-3 pr-4 font-semibold">
                    {formatTND(b.total)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${STATUS_BADGE[b.status]}`}>
                      {t.labels.status[
                        b.status as keyof typeof t.labels.status
                      ] ?? b.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <SupplierBookingActions
                      bookingId={b.id}
                      status={b.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
