/*
  Warnings:

  - You are about to drop the column `win` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "win",
ADD COLUMN     "wins" INTEGER NOT NULL DEFAULT 0;
