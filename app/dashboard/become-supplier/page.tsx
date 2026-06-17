import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BecomeSupplierForm } from "@/components/BecomeSupplierForm";
import { getDict } from "@/lib/i18n/server";

export default async function BecomeSupplierPage() {
  const t = getDict();
  const user = await getCurrentUser();
  if (user?.supplierProfile) redirect("/dashboard");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">{t.becomeSupplier.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {t.becomeSupplier.subtitle}
      </p>
      <div className="mt-6">
        <BecomeSupplierForm />
      </div>
    </div>
  );
}
