/*
  Warnings:

  - You are about to drop the `MeetingDateVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingDateVote" DROP CONSTRAINT "MeetingDateVote_meetingId_fkey";

-- DropTable
DROP TABLE "MeetingDateVote";
