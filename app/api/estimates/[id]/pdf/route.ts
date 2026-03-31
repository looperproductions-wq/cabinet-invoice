import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { estimateToPdfData } from "@/lib/pdf/map-estimate-to-pdf";
import { renderEstimatePdfBuffer } from "@/lib/pdf/estimate-pdf";
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
  const estimate = await prisma.estimate.findFirst({
    where: { id, userId },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!estimate) {
    return new Response("Not found", { status: 404 });
  }

  const company = await prisma.company.findUnique({ where: { userId } });
  const data = estimateToPdfData(estimate, company);
  const buffer = await renderEstimatePdfBuffer(data);
  const name = pdfSafeFileName(estimate.estimateNumber);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
