import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up — WowRent" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">
          One account to rent cars and list your own.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
