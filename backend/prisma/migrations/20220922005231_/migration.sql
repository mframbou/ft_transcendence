/*
  Warnings:

  - The primary key for the `ChatRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id");
