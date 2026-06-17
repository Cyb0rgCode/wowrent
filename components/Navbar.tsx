import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type NavUser = {
  name: string;
  email: string;
  isSupplier: boolean;
};

export function Navbar({
  user,
  unreadCount,
}: {
  user: NavUser | null;
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-end gap-0">
          <img
            src="/logo.svg"
            alt="wow"
            className="h-10 w-auto mb-0.5"
          />
          <span className="text-2xl font-extrabold leading-none text-brand-600 -ml-1 mb-px">
            Rent
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/cars"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Browse cars
          </Link>

          {user ? (
            <>
              <Link
                href="/trips"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                My trips
              </Link>
              <Link
                href="/messages"
                className="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                {user.isSupplier ? "Dashboard" : "Host"}
              </Link>
              <div className="ml-1 flex items-center gap-2">
                <span className="hidden text-sm text-gray-500 md:inline">
                  {user.name.split(" ")[0]}
                </span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
