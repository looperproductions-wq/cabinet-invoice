import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/require-user";
import { GuestBanner } from "@/components/GuestBanner";

export default async function ClientsPage() {
  const user = await getOptionalUser();
  const clients = user
    ? await prisma.client.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
        include: {
          _count: { select: { invoices: true, estimates: true } },
        },
      })
    : [];

  const addHref = user
    ? "/clients/new"
    : `/signup?callbackUrl=${encodeURIComponent("/clients/new")}`;

  return (
    <div className="space-y-8">
      {!user && <GuestBanner callbackPath="/clients" />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Clients
          </h1>
          <p className="mt-1 text-stone-600">
            People and businesses you bill.
          </p>
        </div>
        <Link
          href={addHref}
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          {user ? "Add client" : "Add client (sign up to save)"}
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-600">
          <p>{user ? "No clients yet." : "No saved clients while browsing as a guest."}</p>
          {user ? (
            <Link
              href="/clients/new"
              className="mt-2 inline-block font-medium text-stone-900 underline"
            >
              Add your first client
            </Link>
          ) : (
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent("/clients/new")}`}
              className="mt-2 inline-block font-medium text-stone-900 underline"
            >
              Create an account to add clients
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clients/${c.id}`}
                className="block px-4 py-4 transition hover:bg-stone-50"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{c.name}</p>
                    <p className="text-sm text-stone-600">
                      {[c.email, c.phone].filter(Boolean).join(" · ") ||
                        "No contact on file"}
                    </p>
                  </div>
                  <span className="text-sm text-stone-500">
                    {c._count.invoices} inv
                    {c._count.invoices === 1 ? "" : "s"} · {c._count.estimates}{" "}
                    est
                    {c._count.estimates === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
