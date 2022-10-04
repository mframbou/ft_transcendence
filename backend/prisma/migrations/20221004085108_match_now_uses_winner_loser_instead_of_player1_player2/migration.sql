/*
  Warnings:

  - You are about to drop the column `player1Login` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player1Score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2Login` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2Score` on the `Match` table. All the data in the column will be lost.
  - Added the required column `loserLogin` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loserScore` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerLogin` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerScore` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_player1Login_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_player2Login_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "player1Login",
DROP COLUMN "player1Score",
DROP COLUMN "player2Login",
DROP COLUMN "player2Score",
ADD COLUMN     "loserLogin" TEXT NOT NULL,
ADD COLUMN     "loserScore" INTEGER NOT NULL,
ADD COLUMN     "winnerLogin" TEXT NOT NULL,
ADD COLUMN     "winnerScore" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerLogin_fkey" FOREIGN KEY ("winnerLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserLogin_fkey" FOREIGN KEY ("loserLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
