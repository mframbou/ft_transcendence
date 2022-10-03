/*
  Warnings:

  - The `muted_timestamp` column on the `ChatRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `banned_timestamp` on the `ChatRoom` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "muted_timestamp",
ADD COLUMN     "muted_timestamp" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ALTER COLUMN "banned_timestamp" SET DATA TYPE INTEGER[];
