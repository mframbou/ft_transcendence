/*
  Warnings:

  - A unique constraint covering the columns `[sessionCookie]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionCookie" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionCookie_key" ON "User"("sessionCookie");
