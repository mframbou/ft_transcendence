-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blocked" TEXT[],
ADD COLUMN     "friends" TEXT[],
ALTER COLUMN "onlineStatus" SET DEFAULT 'OFFLINE';
