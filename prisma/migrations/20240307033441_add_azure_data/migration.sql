/*
  Warnings:

  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "Budget";

-- CreateTable
CREATE TABLE "Budgets" (
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

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Alerts" (
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

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("name")
);
