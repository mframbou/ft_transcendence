/*
  Warnings:

  - You are about to alter the column `banned_timestamp` on the `ChatRoom` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ALTER COLUMN "banned_timestamp" SET DATA TYPE BIGINT[];
