/*
  Warnings:

  - You are about to drop the column `participentId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "Participent" DROP CONSTRAINT "Participent_chatId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "participentId";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Participent";
