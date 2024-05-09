/*
  Warnings:

  - Made the column `image` on table `Reply` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Reply` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Thread` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isLiked` on table `Thread` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reply" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "Thread" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "isLiked" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
