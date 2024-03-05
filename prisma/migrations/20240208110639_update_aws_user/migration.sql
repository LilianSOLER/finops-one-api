/*
  Warnings:

  - You are about to drop the column `createAt` on the `Aws_credentials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aws_credentials" DROP COLUMN "createAt";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "hash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
