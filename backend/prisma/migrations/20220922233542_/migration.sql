/*
  Warnings:

  - You are about to drop the `Participent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Participent" DROP CONSTRAINT "Participent_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "Participent" DROP CONSTRAINT "Participent_userId_fkey";

-- DropTable
DROP TABLE "Participent";

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "is_admin" BOOLEAN NOT NULL,
    "is_moderator" BOOLEAN NOT NULL,
    "chatRoomId" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
