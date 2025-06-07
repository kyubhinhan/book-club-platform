-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "Discussion_meetingId_fkey";

-- AlterTable
ALTER TABLE "Discussion" ALTER COLUMN "meetingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
