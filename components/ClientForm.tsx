"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { createClient, updateClient } from "@/app/actions/clients";

type Props =
  | { mode: "create"; action?: undefined; client?: undefined }
  | { mode: "edit"; client: Client; action?: undefined };

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-400 focus:border-stone-400 focus:ring-2";

export function ClientForm(props: Props) {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    try {
      if (props.mode === "create") {
        const res = await createClient(formData);
        if (res?.error) setError(res.error);
      } else {
        const res = await updateClient(props.client.id, formData);
        if (res?.error) setError(res.error);
      }
    } catch {
      /* redirect throws */
    }
  }

  const c = props.mode === "edit" ? props.client : null;

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      {error && (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={c?.name ?? ""}
          className={fieldClass}
          placeholder="Jane Smith"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={c?.email ?? ""}
            className={fieldClass}
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-stone-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={c?.phone ?? ""}
            className={fieldClass}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      <div>
        <label htmlFor="company" className="text-sm font-medium text-stone-700">
          Company
        </label>
        <input
          id="company"
          name="company"
          defaultValue={c?.company ?? ""}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="address" className="text-sm font-medium text-stone-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={c?.address ?? ""}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="notes" className="text-sm font-medium text-stone-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={c?.notes ?? ""}
          className={fieldClass}
          placeholder="Gate code, paint preferences…"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          {props.mode === "create" ? "Add client" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
