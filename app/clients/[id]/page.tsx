import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/ClientForm";
import { DeleteClientButton } from "@/components/DeleteClientButton";

type Props = { params: Promise<{ id: string }> };

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { issueDate: "desc" },
        take: 10,
        select: { id: true, invoiceNumber: true, status: true, issueDate: true },
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/clients"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Clients
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          {client.name}
        </h1>
        <p className="mt-1 text-stone-600">Edit details or remove the client.</p>
      </div>

      <section>
        <h2 className="mb-4 text-base font-semibold text-stone-900">
          Client details
        </h2>
        <ClientForm mode="edit" client={client} />
      </section>

      <section className="border-t border-stone-200 pt-8">
        <h2 className="mb-4 text-base font-semibold text-stone-900">
          Recent invoices
        </h2>
        {client.invoices.length === 0 ? (
          <p className="text-sm text-stone-600">No invoices for this client yet.</p>
        ) : (
          <ul className="space-y-2">
            {client.invoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm hover:bg-stone-50"
                >
                  <span className="font-medium text-stone-900">
                    {inv.invoiceNumber}
                  </span>
                  <span className="text-stone-500">
                    {inv.issueDate.toLocaleDateString()} · {inv.status.toLowerCase()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="no-print border-t border-stone-200 pt-8">
        <h2 className="mb-4 text-base font-semibold text-red-900">Danger zone</h2>
        <DeleteClientButton clientId={client.id} />
      </section>
    </div>
  );
}
