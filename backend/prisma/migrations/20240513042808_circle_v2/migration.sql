/*
  Warnings:

  - You are about to drop the column `FolowedAt` on the `Follow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "FolowedAt",
ADD COLUMN     "folowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
