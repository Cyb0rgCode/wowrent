import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isSupplier = Boolean(user.supplierProfile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Host dashboard
          </p>
          {isSupplier ? (
            <>
              <NavItem href="/dashboard">Overview</NavItem>
              <NavItem href="/dashboard/cars">My cars</NavItem>
              <NavItem href="/dashboard/bookings">Bookings</NavItem>
              <NavItem href="/dashboard/cars/new">+ List a car</NavItem>
            </>
          ) : (
            <NavItem href="/dashboard/become-supplier">Become a host</NavItem>
          )}
          <div className="pt-3">
            <Link href="/cars" className="px-3 text-sm text-brand-600">
              ← Back to site
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
