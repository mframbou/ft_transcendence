-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "banned" TEXT[] DEFAULT ARRAY[]::TEXT[];
