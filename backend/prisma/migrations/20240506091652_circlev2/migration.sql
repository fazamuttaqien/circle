-- AlterTable
ALTER TABLE "Reply" ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Thread" ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;
