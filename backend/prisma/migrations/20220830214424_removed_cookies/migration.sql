/*
  Warnings:

  - You are about to drop the column `sessionCookie` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_sessionCookie_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sessionCookie";
