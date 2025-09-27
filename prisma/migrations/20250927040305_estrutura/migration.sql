/*
  Warnings:

  - You are about to drop the column `itemId` on the `pedido_itens` table. All the data in the column will be lost.
  - You are about to alter the column `quantidade` on the `pedido_itens` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `precoUnitario` on the `pedido_itens` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `subtotal` on the `pedido_itens` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the `itens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[numero]` on the table `comandas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `produtoId` to the `pedido_itens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusComanda" ADD VALUE 'CANCELADA';
ALTER TYPE "StatusComanda" ADD VALUE 'PENDENTE';

-- DropForeignKey
ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_itemId_fkey";

-- DropIndex
DROP INDEX "comandas_numero_data_key";

-- DropIndex
DROP INDEX "pedido_itens_comandaId_itemId_key";

-- AlterTable
ALTER TABLE "pedido_itens" DROP COLUMN "itemId",
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "produtoId" INTEGER NOT NULL,
ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "precoUnitario" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2);

-- DropTable
DROP TABLE "itens";

-- DropEnum
DROP TYPE "TipoItem";

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagem" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "tipo_item" TEXT DEFAULT 'REFEICAO_FIXO',

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "comandas_numero_key" ON "comandas"("numero");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
