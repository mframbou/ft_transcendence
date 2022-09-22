/*
  Warnings:

  - You are about to drop the column `userId` on the `Participent` table. All the data in the column will be lost.
  - Added the required column `userLogin` to the `Participent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participent" DROP CONSTRAINT "Participent_userId_fkey";

-- AlterTable
ALTER TABLE "Participent" DROP COLUMN "userId",
ADD COLUMN     "userLogin" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Participent" ADD CONSTRAINT "Participent_userLogin_fkey" FOREIGN KEY ("userLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
