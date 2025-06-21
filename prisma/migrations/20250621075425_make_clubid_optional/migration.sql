-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_clubId_fkey";

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "clubId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "BookClub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
