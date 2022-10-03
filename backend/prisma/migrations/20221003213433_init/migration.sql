/*
  Warnings:

  - The `banned_timestamp` column on the `ChatRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "banned_timestamp",
ADD COLUMN     "banned_timestamp" BIGINT[] DEFAULT ARRAY[]::BIGINT[];
