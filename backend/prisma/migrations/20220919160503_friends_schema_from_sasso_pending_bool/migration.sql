/*
  Warnings:

  - You are about to drop the `_Blocked` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Blocked" DROP CONSTRAINT "_Blocked_A_fkey";

-- DropForeignKey
ALTER TABLE "_Blocked" DROP CONSTRAINT "_Blocked_B_fkey";

-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_B_fkey";

-- DropTable
DROP TABLE "_Blocked";

-- DropTable
DROP TABLE "_Friends";

-- CreateTable
CREATE TABLE "Friends" (
    "login" TEXT NOT NULL,
    "friendLogin" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("login","friendLogin")
);

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendLogin_fkey" FOREIGN KEY ("friendLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
