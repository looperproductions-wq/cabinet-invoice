"use client";

import { useMemo, useState } from "react";
import type { Client, Estimate, EstimateLineItem } from "@prisma/client";
import {
  createEstimate,
  updateEstimate,
  type EstimateLinePayload,
} from "@/app/actions/estimates";
import { bpsToPercentLabel, centsToDollars } from "@/lib/money";
import { invoiceTotalCents } from "@/lib/invoice-calcs";
import { SAVE_REQUIRES_ACCOUNT } from "@/lib/save-account";
import { GuestSavePrompt } from "@/components/GuestSavePrompt";
import Link from "next/link";

type LineRow = { description: string; quantity: string; unitDollars: string };

type Props =
  | {
      mode: "create";
      clients: Pick<Client, "id" | "name" | "company">[];
      callbackPath: string;
    }
  | {
      mode: "edit";
      clients: Pick<Client, "id" | "name" | "company">[];
      estimate: Estimate & { lineItems: EstimateLineItem[] };
      callbackPath: string;
    };

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400";

function toDateInput(d: Date): string {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EstimateForm(props: Props) {
  const initialLines: LineRow[] = useMemo(() => {
    if (props.mode === "edit") {
      return props.estimate.lineItems
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((li) => ({
          description: li.description,
          quantity: String(li.quantity),
          unitDollars: (li.unitAmountCents / 100).toFixed(2),
        }));
    }
    return [
      {
        description: "Interior painting (estimate)",
        quantity: "1",
        unitDollars: "",
      },
    ];
  }, [props]);

  const [clientId, setClientId] = useState(
    props.mode === "edit" ? props.estimate.clientId : ""
  );
  const [issueDate, setIssueDate] = useState(
    props.mode === "edit"
      ? toDateInput(props.estimate.issueDate)
      : toDateInput(new Date())
  );
  const [validUntil, setValidUntil] = useState(
    props.mode === "edit" && props.estimate.validUntil
      ? toDateInput(props.estimate.validUntil)
      : ""
  );
  const [taxPercent, setTaxPercent] = useState(
    props.mode === "edit"
      ? bpsToPercentLabel(props.estimate.taxRateBps)
      : "0"
  );
  const [notes, setNotes] = useState(
    props.mode === "edit" ? props.estimate.notes ?? "" : ""
  );
  const [status, setStatus] = useState(
    props.mode === "edit" ? props.estimate.status : "DRAFT"
  );
  const [lines, setLines] = useState<LineRow[]>(initialLines);
  const [error, setError] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const previewTotals = useMemo(() => {
    const fakeItems = lines
      .filter((l) => l.description.trim())
      .map((l, i) => ({
        quantity: parseFloat(l.quantity) || 1,
        unitAmountCents: Math.round((parseFloat(l.unitDollars) || 0) * 100),
      }));
    const bps = Math.round((parseFloat(taxPercent) || 0) * 100);
    return invoiceTotalCents(fakeItems, bps);
  }, [lines, taxPercent]);

  function addLine() {
    setLines((prev) => [
      ...prev,
      { description: "", quantity: "1", unitDollars: "" },
    ]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<LineRow>) {
    setLines((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payloadLines: EstimateLinePayload[] = lines.map((l) => ({
      description: l.description,
      quantity: parseFloat(l.quantity) || 1,
      unitDollars: l.unitDollars,
    }));
    if (!clientId.trim() && !newClientName.trim()) {
      setError(
        "Select an existing client or enter a new client name under Prepared for."
      );
      return;
    }

    const clientPayload = {
      clientId,
      newClientName,
      newClientCompany,
      newClientEmail,
      newClientPhone,
    };

    try {
      if (props.mode === "create") {
        const res = await createEstimate({
          ...clientPayload,
          issueDate,
          validUntil,
          taxPercent,
          notes,
          lines: payloadLines,
        });
        if (res?.error) setError(res.error);
      } else {
        const res = await updateEstimate(props.estimate.id, {
          ...clientPayload,
          issueDate,
          validUntil,
          taxPercent,
          notes,
          status,
          lines: payloadLines,
        });
        if (res?.error) setError(res.error);
      }
    } catch {
      /* redirect */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && error !== SAVE_REQUIRES_ACCOUNT && (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {error === SAVE_REQUIRES_ACCOUNT && (
        <GuestSavePrompt callbackPath={props.callbackPath} />
      )}

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-stone-800">Prepared for</p>
          <p className="mt-1 text-sm text-stone-500">
            Choose a saved client, or enter a new one for this estimate (saved when
            you sign in).
          </p>
          <label htmlFor="clientId" className="mt-3 block text-sm font-medium text-stone-700">
            Existing client
          </label>
          <select
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={fieldClass}
          >
            <option value="">None — use new client below</option>
            {props.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-stone-500">
            Or{" "}
            <Link
              href="/clients/new"
              className="font-medium text-stone-800 underline"
            >
              add a client on its own page
            </Link>
            .
          </p>
          <div className="mt-4 space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              New client on this estimate
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="newEstClientName" className="text-xs text-stone-600">
                  Name (required if no client selected)
                </label>
                <input
                  id="newEstClientName"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className={fieldClass}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="newEstClientCompany" className="text-xs text-stone-600">
                  Company
                </label>
                <input
                  id="newEstClientCompany"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="newEstClientEmail" className="text-xs text-stone-600">
                  Email
                </label>
                <input
                  id="newEstClientEmail"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="newEstClientPhone" className="text-xs text-stone-600">
                  Phone
                </label>
                <input
                  id="newEstClientPhone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="issueDate" className="text-sm font-medium text-stone-700">
            Issue date
          </label>
          <input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="validUntil" className="text-sm font-medium text-stone-700">
            Valid until
          </label>
          <input
            id="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-stone-500">
            Optional — when this quote expires.
          </p>
        </div>
        <div>
          <label htmlFor="tax" className="text-sm font-medium text-stone-700">
            Tax (%)
          </label>
          <input
            id="tax"
            inputMode="decimal"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            className={fieldClass}
            placeholder="0"
          />
        </div>
        {props.mode === "edit" && (
          <div>
            <label htmlFor="status" className="text-sm font-medium text-stone-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={fieldClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-stone-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={fieldClass}
            placeholder="Scope, paint brand, timeline…"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-stone-900">Line items</h2>
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Add line
          </button>
        </div>
        <div className="space-y-4">
          {lines.map((line, index) => (
            <div
              key={index}
              className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"
            >
              <div className="mb-2 flex justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Line {index + 1}
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-xs font-medium text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <label className="text-xs text-stone-600">Description</label>
                  <input
                    value={line.description}
                    onChange={(e) =>
                      updateLine(index, { description: e.target.value })
                    }
                    className={fieldClass}
                    placeholder="Service description"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-stone-600">Qty</label>
                  <input
                    inputMode="decimal"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-xs text-stone-600">Unit price ($)</label>
                  <input
                    inputMode="decimal"
                    value={line.unitDollars}
                    onChange={(e) =>
                      updateLine(index, { unitDollars: e.target.value })
                    }
                    className={fieldClass}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-stone-900">
              {centsToDollars(previewTotals.subtotalCents)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Tax</span>
            <span className="font-medium text-stone-900">
              {centsToDollars(previewTotals.taxCents)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
            <span>Estimated total</span>
            <span>{centsToDollars(previewTotals.totalCents)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          {props.mode === "create" ? "Create estimate" : "Save estimate"}
        </button>
        <Link
          href={
            props.mode === "edit"
              ? `/estimates/${props.estimate.id}`
              : "/estimates"
          }
          className="inline-flex items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
