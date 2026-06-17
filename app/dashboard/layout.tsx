import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isSupplier = Boolean(user.supplierProfile);
  const t = getDict();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t.dashboard.hostDashboard}
          </p>
          {isSupplier ? (
            <>
              <NavItem href="/dashboard">{t.dashboard.overview}</NavItem>
              <NavItem href="/dashboard/cars">{t.dashboard.myCars}</NavItem>
              <NavItem href="/dashboard/bookings">{t.dashboard.bookings}</NavItem>
              <NavItem href="/dashboard/cars/new">{t.dashboard.listCar}</NavItem>
            </>
          ) : (
            <NavItem href="/dashboard/become-supplier">
              {t.dashboard.becomeHost}
            </NavItem>
          )}
          <div className="pt-3">
            <Link href="/cars" className="px-3 text-sm text-brand-600">
              {t.dashboard.backToSite}
            </Link>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
