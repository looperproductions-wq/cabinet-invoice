"use client";

import { useRouter } from "next/navigation";
import { setEstimateStatus } from "@/app/actions/estimates";

const statuses = [
  { value: "DRAFT", label: "Draft", className: "border-stone-300 hover:bg-stone-50" },
  {
    value: "SENT",
    label: "Sent",
    className: "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  },
  {
    value: "DECLINED",
    label: "Declined",
    className: "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
  },
] as const;

export function EstimateStatusActions({
  estimateId,
  current,
}: {
  estimateId: string;
  current: string;
}) {
  const router = useRouter();

  async function setStatus(status: string) {
    await setEstimateStatus(estimateId, status);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses
        .filter((s) => s.value !== current)
        .map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${s.className}`}
          >
            Mark {s.label.toLowerCase()}
          </button>
        ))}
    </div>
  );
}
