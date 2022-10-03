/*
  Warnings:

  - The `banned_timestamp` column on the `ChatRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "muted" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "muted_timestamp" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
DROP COLUMN "banned_timestamp",
ADD COLUMN     "banned_timestamp" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
