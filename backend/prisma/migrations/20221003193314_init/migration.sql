-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "banned_timestamp" TEXT[] DEFAULT ARRAY[]::TEXT[];
