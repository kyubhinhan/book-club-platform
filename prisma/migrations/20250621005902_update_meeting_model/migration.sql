/*
  Warnings:

  - You are about to drop the column `endDate` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingDay` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingFrequency` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingTime` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingType` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Meeting` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingDate` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendationReason` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `Meeting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "endDate",
DROP COLUMN "meetingDay",
DROP COLUMN "meetingFrequency",
DROP COLUMN "meetingTime",
DROP COLUMN "meetingType",
DROP COLUMN "startDate",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "meetingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "range" TEXT,
ADD COLUMN     "recommendationReason" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ALTER COLUMN "location" SET NOT NULL;
