-- AlterTable
ALTER TABLE "Code" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PasswordToken" ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true;
