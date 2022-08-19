-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "tel" TEXT NOT NULL DEFAULT '',
    "img" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "idIntra" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "win" INTEGER NOT NULL DEFAULT 0,
    "loses" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 1000,
    "twoFa" BOOLEAN NOT NULL DEFAULT false,
    "otpSecret" TEXT NOT NULL DEFAULT '',
    "otpUrl" TEXT NOT NULL DEFAULT '',
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "firstLogin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_idIntra_key" ON "User"("idIntra");
