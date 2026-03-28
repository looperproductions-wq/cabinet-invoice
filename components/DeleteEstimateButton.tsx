"use client";

import { deleteEstimate } from "@/app/actions/estimates";

export function DeleteEstimateButton({ estimateId }: { estimateId: string }) {
  async function onDelete() {
    if (!confirm("Delete this estimate? This cannot be undone.")) return;
    try {
      await deleteEstimate(estimateId);
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
      Delete estimate
    </button>
  );
}
