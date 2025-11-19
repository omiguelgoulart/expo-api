/*
  Warnings:

  - You are about to drop the column `empresaId` on the `categorias` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `comandas` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `empresas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nome]` on the table `categorias` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "categorias" DROP CONSTRAINT "categorias_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "comandas" DROP CONSTRAINT "comandas_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_empresaId_fkey";

-- DropIndex
DROP INDEX "categorias_empresaId_nome_key";

-- AlterTable
ALTER TABLE "categorias" DROP COLUMN "empresaId";

-- AlterTable
ALTER TABLE "comandas" DROP COLUMN "empresaId";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "empresaId";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "empresaId";

-- DropTable
DROP TABLE "empresas";

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");
