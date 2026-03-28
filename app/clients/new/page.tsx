import Link from "next/link";
import { getOptionalUser } from "@/lib/require-user";
import { ClientForm } from "@/components/ClientForm";
import { GuestGate } from "@/components/GuestGate";

export default async function NewClientPage() {
  const user = await getOptionalUser();

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
      {user ? (
        <ClientForm mode="create" />
      ) : (
        <GuestGate
          title="Sign in to save clients"
          description="Adding a client saves to your account. Create a free account or sign in to continue."
          callbackPath="/clients/new"
        />
      )}
    </div>
  );
}
