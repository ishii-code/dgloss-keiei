-- CreateTable
CREATE TABLE "BusinessUnit" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFinancial" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "planRevenue" INTEGER NOT NULL DEFAULT 0,
    "planCost" INTEGER NOT NULL DEFAULT 0,
    "actualRevenue" INTEGER NOT NULL DEFAULT 0,
    "actualCost" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_code_key" ON "BusinessUnit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFinancial_unitId_fiscalYear_month_key" ON "MonthlyFinancial"("unitId", "fiscalYear", "month");

-- AddForeignKey
ALTER TABLE "MonthlyFinancial" ADD CONSTRAINT "MonthlyFinancial_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "BusinessUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
