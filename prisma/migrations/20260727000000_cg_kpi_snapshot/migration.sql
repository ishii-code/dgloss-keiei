-- CreateTable
CREATE TABLE "CgKpiSnapshot" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "metrics" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'cg-api',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CgKpiSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CgKpiSnapshot_fetchedAt_idx" ON "CgKpiSnapshot"("fetchedAt");
