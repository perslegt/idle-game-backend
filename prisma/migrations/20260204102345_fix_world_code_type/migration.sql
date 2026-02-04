/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `worlds` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "worlds" ALTER COLUMN "code" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "worlds_code_key" ON "worlds"("code");
