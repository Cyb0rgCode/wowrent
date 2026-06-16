import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BecomeSupplierForm } from "@/components/BecomeSupplierForm";

export default async function BecomeSupplierPage() {
  const user = await getCurrentUser();
  if (user?.supplierProfile) redirect("/dashboard");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Become a host</h1>
      <p className="mt-1 text-sm text-gray-600">
        List your cars as a private owner or a rental agency and start earning.
      </p>
      <div className="mt-6">
        <BecomeSupplierForm />
      </div>
    </div>
  );
}
