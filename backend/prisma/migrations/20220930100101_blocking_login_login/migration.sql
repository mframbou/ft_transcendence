/*
  Warnings:

  - The primary key for the `BlockedUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockingLogin` on the `BlockedUsers` table. All the data in the column will be lost.
  - Added the required column `login` to the `BlockedUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlockedUsers" DROP CONSTRAINT "BlockedUsers_blockingLogin_fkey";

-- AlterTable
ALTER TABLE "BlockedUsers" DROP CONSTRAINT "BlockedUsers_pkey",
DROP COLUMN "blockingLogin",
ADD COLUMN     "login" TEXT NOT NULL,
ADD CONSTRAINT "BlockedUsers_pkey" PRIMARY KEY ("login", "blockedLogin");

-- AddForeignKey
ALTER TABLE "BlockedUsers" ADD CONSTRAINT "BlockedUsers_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
