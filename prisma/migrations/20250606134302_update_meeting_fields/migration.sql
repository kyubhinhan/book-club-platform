/*
  Warnings:

  - You are about to drop the column `date` on the `Meeting` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxParticipants` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingDay` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingFrequency` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingTime` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingType` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "date",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER NOT NULL,
ADD COLUMN     "meetingDay" TEXT NOT NULL,
ADD COLUMN     "meetingFrequency" TEXT NOT NULL,
ADD COLUMN     "meetingTime" TEXT NOT NULL,
ADD COLUMN     "meetingType" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
