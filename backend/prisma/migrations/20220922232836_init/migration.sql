/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatRoomId` to the `Participent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- AlterTable
ALTER TABLE "Participent" ADD COLUMN     "chatRoomId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Message";

-- AddForeignKey
ALTER TABLE "Participent" ADD CONSTRAINT "Participent_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
