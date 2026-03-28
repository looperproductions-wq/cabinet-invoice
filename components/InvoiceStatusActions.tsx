"use client";

import { useRouter } from "next/navigation";
import { setInvoiceStatus } from "@/app/actions/invoices";

export function InvoiceStatusActions({
  invoiceId,
  current,
}: {
  invoiceId: string;
  current: string;
}) {
  const router = useRouter();

  async function setStatus(status: string) {
    await setInvoiceStatus(invoiceId, status);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {current !== "DRAFT" && (
        <button
          type="button"
          onClick={() => setStatus("DRAFT")}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Mark draft
        </button>
      )}
      {current !== "SENT" && (
        <button
          type="button"
          onClick={() => setStatus("SENT")}
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          Mark sent
        </button>
      )}
      {current !== "PAID" && (
        <button
          type="button"
          onClick={() => setStatus("PAID")}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Mark paid
        </button>
      )}
    </div>
  );
}
