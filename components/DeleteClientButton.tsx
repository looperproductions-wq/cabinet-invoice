"use client";

import { useState } from "react";
import { deleteClient } from "@/app/actions/clients";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    setMsg(null);
    try {
      const res = await deleteClient(clientId);
      if (res?.error) setMsg(res.error);
    } catch {
      /* redirect */
    }
  }

  return (
    <div>
      {msg && (
        <p className="mb-2 text-sm text-red-700" role="alert">
          {msg}
        </p>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
      >
        Delete client
      </button>
    </div>
  );
}
