-- CreateEnum
CREATE TYPE "HerokuInvoiceState" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- CreateTable
CREATE TABLE "HerokuInvoice" (
    "id" TEXT NOT NULL,
    "chargesTotal" DOUBLE PRECISION NOT NULL,
    "creditsTotal" DOUBLE PRECISION NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "state" "HerokuInvoiceState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HerokuInvoice_pkey" PRIMARY KEY ("id")
);
