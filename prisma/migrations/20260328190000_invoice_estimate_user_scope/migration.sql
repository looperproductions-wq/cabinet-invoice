-- Invoice: owner + per-user unique numbers
ALTER TABLE "Invoice" ADD COLUMN "userId" TEXT;

UPDATE "Invoice" i
SET "userId" = c."userId"
FROM "Client" c
WHERE i."clientId" = c.id;

UPDATE "Invoice"
SET "userId" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" LIMIT 1);

DELETE FROM "InvoiceLineItem" WHERE "invoiceId" IN (SELECT id FROM "Invoice" WHERE "userId" IS NULL);
DELETE FROM "Invoice" WHERE "userId" IS NULL;

ALTER TABLE "Invoice" ALTER COLUMN "userId" SET NOT NULL;

DROP INDEX IF EXISTS "Invoice_invoiceNumber_key";

CREATE UNIQUE INDEX "Invoice_userId_invoiceNumber_key" ON "Invoice"("userId", "invoiceNumber");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Estimate: owner + per-user unique numbers
ALTER TABLE "Estimate" ADD COLUMN "userId" TEXT;

UPDATE "Estimate" e
SET "userId" = c."userId"
FROM "Client" c
WHERE e."clientId" = c.id;

UPDATE "Estimate"
SET "userId" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" LIMIT 1);

DELETE FROM "EstimateLineItem" WHERE "estimateId" IN (SELECT id FROM "Estimate" WHERE "userId" IS NULL);
DELETE FROM "Estimate" WHERE "userId" IS NULL;

ALTER TABLE "Estimate" ALTER COLUMN "userId" SET NOT NULL;

DROP INDEX IF EXISTS "Estimate_estimateNumber_key";

CREATE UNIQUE INDEX "Estimate_userId_estimateNumber_key" ON "Estimate"("userId", "estimateNumber");

ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
