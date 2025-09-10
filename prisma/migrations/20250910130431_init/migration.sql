-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('REFEICAO_PESO', 'REFEICAO_FIXO', 'SOBREMESA', 'SUCO', 'PAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusComanda" AS ENUM ('ABERTA', 'FECHADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comandas" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusComanda" NOT NULL DEFAULT 'ABERTA',

    CONSTRAINT "comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens" (
    "codigo" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoItem" NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "itens_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "comandaId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "comandas_numero_data_key" ON "comandas"("numero", "data");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_itens_comandaId_itemId_key" ON "pedido_itens"("comandaId", "itemId");

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "comandas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "itens"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
