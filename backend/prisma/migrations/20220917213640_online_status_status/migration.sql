/*
  Warnings:

  - You are about to drop the column `onlineStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onlineStatus",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'OFFLINE';
