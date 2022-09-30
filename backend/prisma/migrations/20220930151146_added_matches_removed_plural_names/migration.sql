/*
  Warnings:

  - You are about to drop the `BlockedUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlockedUsers" DROP CONSTRAINT "BlockedUsers_blockedLogin_fkey";

-- DropForeignKey
ALTER TABLE "BlockedUsers" DROP CONSTRAINT "BlockedUsers_login_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_friendLogin_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_login_fkey";

-- DropTable
DROP TABLE "BlockedUsers";

-- DropTable
DROP TABLE "Friends";

-- CreateTable
CREATE TABLE "Friend" (
    "login" TEXT NOT NULL,
    "friendLogin" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("login","friendLogin")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "login" TEXT NOT NULL,
    "blockedLogin" TEXT NOT NULL,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("login","blockedLogin")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "player1Login" TEXT NOT NULL,
    "player2Login" TEXT NOT NULL,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendLogin_fkey" FOREIGN KEY ("friendLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockedLogin_fkey" FOREIGN KEY ("blockedLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Login_fkey" FOREIGN KEY ("player1Login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Login_fkey" FOREIGN KEY ("player2Login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
