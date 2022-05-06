/*
  Warnings:

  - Changed the type of `provider` on the `Code` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `isVerified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CODE_TYPE" AS ENUM ('EMAIL_VERIFICATION');

-- AlterTable
ALTER TABLE "Code" DROP COLUMN "provider",
ADD COLUMN     "provider" "CODE_TYPE" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL;
