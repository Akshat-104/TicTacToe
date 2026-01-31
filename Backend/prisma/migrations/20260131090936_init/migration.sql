/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `socketId` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_PlayerGames` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_PlayerGames` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_PlayerGames` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_PlayerGames" DROP CONSTRAINT "_PlayerGames_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerGames" DROP CONSTRAINT "_PlayerGames_B_fkey";

-- DropIndex
DROP INDEX "User_socketId_key";

-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "socketId",
ADD COLUMN     "password" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_PlayerGames" DROP CONSTRAINT "_PlayerGames_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_PlayerGames_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "_PlayerGames_B_index" ON "_PlayerGames"("B");

-- AddForeignKey
ALTER TABLE "_PlayerGames" ADD CONSTRAINT "_PlayerGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerGames" ADD CONSTRAINT "_PlayerGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
