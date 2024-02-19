-- CreateTable
CREATE TABLE "CostAndUsage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "etag" TEXT,

    CONSTRAINT "CostAndUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostAndUsageValues" (
    "cost" DOUBLE PRECISION NOT NULL,
    "usageDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "costAndUsageId" TEXT NOT NULL,

    CONSTRAINT "CostAndUsageValues_pkey" PRIMARY KEY ("usageDate")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "eTag" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeGrain" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentSpend" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "alertCategory" TEXT NOT NULL,
    "alertCriteria" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timeGrainType" TEXT NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "operator" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "currentSpend" DOUBLE PRECISION NOT NULL,
    "costEntityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "modificationTime" TIMESTAMP(3) NOT NULL,
    "statusModificationTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CostAndUsageValues" ADD CONSTRAINT "CostAndUsageValues_costAndUsageId_fkey" FOREIGN KEY ("costAndUsageId") REFERENCES "CostAndUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
