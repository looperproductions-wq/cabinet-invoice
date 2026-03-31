import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invoiceToPdfData } from "@/lib/pdf/map-invoice-to-pdf";
import { renderInvoicePdfBuffer } from "@/lib/pdf/invoice-pdf";
import { pdfSafeFileName } from "@/lib/pdf/safe-filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }

  const company = await prisma.company.findUnique({ where: { userId } });
  const data = invoiceToPdfData(invoice, company);
  const buffer = await renderInvoicePdfBuffer(data);
  const name = pdfSafeFileName(invoice.invoiceNumber);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
