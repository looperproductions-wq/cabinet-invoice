import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { ClientForm } from "@/components/ClientForm";

export default async function NewClientPage() {
  await requireUser();
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/clients"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Clients
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          New client
        </h1>
        <p className="mt-1 text-stone-600">
          Store contact details for estimates and invoices.
        </p>
      </div>
      <ClientForm mode="create" />
    </div>
  );
}
