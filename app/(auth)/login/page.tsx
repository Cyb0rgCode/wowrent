import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in — wowRent" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-600">
          Log in to book cars and manage your listings.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
