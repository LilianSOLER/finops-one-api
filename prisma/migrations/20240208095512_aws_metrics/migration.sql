-- CreateTable
CREATE TABLE "Aws_metrics" (
    "id" SERIAL NOT NULL,
    "timePeriod" TIMESTAMP(3) NOT NULL,
    "service" TEXT NOT NULL,
    "amortizedCost" DOUBLE PRECISION NOT NULL,
    "blendedCost" DOUBLE PRECISION NOT NULL,
    "unblendedCost" DOUBLE PRECISION NOT NULL,
    "netUnblendedCost" DOUBLE PRECISION NOT NULL,
    "netAmortizedCost" DOUBLE PRECISION NOT NULL,
    "normalizedUsageAmount" INTEGER NOT NULL,
    "usageQuantity" INTEGER NOT NULL,

    CONSTRAINT "Aws_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aws_credentials" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,
    "accessKeyId" TEXT NOT NULL,
    "secretAccessKey" TEXT NOT NULL,

    CONSTRAINT "Aws_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aws_credentials_accessKeyId_key" ON "Aws_credentials"("accessKeyId");
