-- CreateTable
CREATE TABLE "ResourcesCosts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ResourcesCosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourcesCostsValues" (
    "cost" DOUBLE PRECISION NOT NULL,
    "usageDate" TIMESTAMP(3) NOT NULL,
    "resourceGroup" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "ResourcesCostsId" TEXT NOT NULL
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

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("name")
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

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourcesCostsValues_usageDate_resourceGroup_resourceType_key" ON "ResourcesCostsValues"("usageDate", "resourceGroup", "resourceType");

-- AddForeignKey
ALTER TABLE "ResourcesCostsValues" ADD CONSTRAINT "ResourcesCostsValues_ResourcesCostsId_fkey" FOREIGN KEY ("ResourcesCostsId") REFERENCES "ResourcesCosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
