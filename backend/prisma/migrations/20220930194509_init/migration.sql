-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "entered_hash" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "is_owner" BOOLEAN NOT NULL DEFAULT false;
