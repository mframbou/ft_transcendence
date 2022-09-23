/*
  Warnings:

  - You are about to drop the column `array` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "array";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "senderId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 0;
