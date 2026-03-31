export function pdfSafeFileName(raw: string): string {
  const s = raw.replace(/[^a-zA-Z0-9-_]+/g, "_").replace(/^_+|_+$/g, "");
  return s.length ? s.slice(0, 80) : "document";
}
