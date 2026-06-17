import Link from "next/link";
import { findCars } from "@/lib/cars";
import { CarCard } from "@/components/CarCard";
import { HomeSearch } from "@/components/HomeSearch";

export default async function HomePage() {
  const featured = (await findCars({})).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Rent the perfect car, anywhere in Tunisia.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-brand-50">
            wowRent connects you with trusted car owners and rental agencies.
            Browse, book and pay securely with Konnect.
          </p>
          <div className="mt-8 max-w-3xl">
            <HomeSearch />
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/cars" className="font-medium underline">
              Browse all cars →
            </Link>
            <span className="text-brand-200">·</span>
            <Link href="/register" className="font-medium underline">
              List your car and earn →
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "For clients",
              body: "Compare cars from owners and agencies, book by the day, and pay online in TND.",
            },
            {
              title: "For owners & agencies",
              body: "List your vehicles in minutes, manage bookings, and get paid through Konnect.",
            },
            {
              title: "Trust built in",
              body: "Real reviews after every trip and in-app messaging to coordinate pickup.",
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
          <h2 className="text-2xl font-bold">Featured cars</h2>
          <Link href="/cars" className="text-sm font-medium text-brand-600">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">
            No cars listed yet. Be the first to{" "}
            <Link href="/register" className="text-brand-600 underline">
              list a car
            </Link>
            .
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
