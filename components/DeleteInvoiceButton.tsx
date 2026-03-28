"use client";

import { deleteInvoice } from "@/app/actions/invoices";

export function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  async function onDelete() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await deleteInvoice(invoiceId);
    } catch {
      /* redirect */
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
    >
      Delete invoice
    </button>
  );
}
