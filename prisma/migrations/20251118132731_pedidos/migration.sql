/*
  Warnings:

  - You are about to drop the `comandas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pedido_itens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produtos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_comandaId_fkey";

-- DropForeignKey
ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_categoriaId_fkey";

-- DropTable
DROP TABLE "comandas";

-- DropTable
DROP TABLE "pedido_itens";

-- DropTable
DROP TABLE "produtos";

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagem" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "tipo_item" TEXT DEFAULT 'REFEICAO_FIXO',

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusComanda" NOT NULL DEFAULT 'ABERTA',

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "comandaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" DECIMAL(10,2),
    "precoUnitario" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "observacoes" TEXT,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "Comanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
