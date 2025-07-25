/*
  Warnings:

  - Added the required column `creatorId` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/

-- 먼저 creatorId 컬럼을 nullable로 추가
ALTER TABLE "Meeting" ADD COLUMN "creatorId" TEXT;

-- 기존 Meeting 데이터에 대해 기본 creator 설정
-- (첫 번째 사용자를 creator로 설정하거나, club의 owner를 creator로 설정)
UPDATE "Meeting" 
SET "creatorId" = (
  SELECT "ownerId" 
  FROM "BookClub" 
  WHERE "BookClub"."id" = "Meeting"."clubId" 
  LIMIT 1
)
WHERE "creatorId" IS NULL;

-- creatorId가 없는 경우 첫 번째 사용자를 creator로 설정
UPDATE "Meeting" 
SET "creatorId" = (
  SELECT "id" 
  FROM "User" 
  LIMIT 1
)
WHERE "creatorId" IS NULL;

-- 이제 NOT NULL 제약조건 추가
ALTER TABLE "Meeting" ALTER COLUMN "creatorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
