-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
