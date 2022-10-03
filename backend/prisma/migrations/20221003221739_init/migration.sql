/*
  Warnings:

  - The `muted_timestamp` column on the `ChatRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "muted_timestamp",
ADD COLUMN     "muted_timestamp" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
