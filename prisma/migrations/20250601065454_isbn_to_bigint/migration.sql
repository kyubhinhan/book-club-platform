/*
  Warnings:

  - The `isbn` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "pubDate" TIMESTAMP(3),
ADD COLUMN     "publisher" TEXT,
DROP COLUMN "isbn",
ADD COLUMN     "isbn" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
