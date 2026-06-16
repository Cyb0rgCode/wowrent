import { requireSupplier } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTND, formatDate, STATUS_BADGE } from "@/lib/format";
import { SupplierBookingActions } from "@/components/SupplierBookingActions";

export const metadata = { title: "Bookings — WowRent" };

export default async function SupplierBookingsPage() {
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
      <h1 className="text-2xl font-bold">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Car</th>
                <th className="py-2 pr-4 font-medium">Client</th>
                <th className="py-2 pr-4 font-medium">Dates</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
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
                      {b.status}
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
