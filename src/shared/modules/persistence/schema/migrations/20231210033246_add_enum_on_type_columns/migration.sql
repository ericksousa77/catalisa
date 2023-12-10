/*
  Warnings:

  - Changed the type of `type` on the `bank_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSITO', 'SAQUE');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CORRENTE', 'POUPANCA');

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "type",
ADD COLUMN     "type" "BankAccountType" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;
