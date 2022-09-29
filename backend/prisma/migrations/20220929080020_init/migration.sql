/*
  Warnings:

  - You are about to drop the column `chatRoomId` on the `Participant` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_chatRoomId_fkey";

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "chatRoomId",
ADD COLUMN     "chatId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
