import Link from "next/link";
import { findCars } from "@/lib/cars";
import { CarCard } from "@/components/CarCard";
import { HomeSearch } from "@/components/HomeSearch";
import { getDict } from "@/lib/i18n/server";

export default async function HomePage() {
  const featured = (await findCars({})).slice(0, 6);
  const t = getDict();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-brand-50">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-8 max-w-3xl">
            <HomeSearch />
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/cars" className="font-medium underline">
              {t.home.browseAll}
            </Link>
            <span className="text-brand-200">·</span>
            <Link href="/register" className="font-medium underline">
              {t.home.listEarn}
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: t.home.forClientsTitle,
              body: t.home.forClientsBody,
            },
            {
              title: t.home.forSuppliersTitle,
              body: t.home.forSuppliersBody,
            },
            {
              title: t.home.trustTitle,
              body: t.home.trustBody,
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured cars */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t.home.featured}</h2>
          <Link href="/cars" className="text-sm font-medium text-brand-600">
            {t.home.viewAll}
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">
            {t.home.emptyBefore}
            <Link href="/register" className="text-brand-600 underline">
              {t.home.emptyLink}
            </Link>
            {t.home.emptyAfter}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
