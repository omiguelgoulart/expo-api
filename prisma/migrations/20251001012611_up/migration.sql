-- DropIndex
DROP INDEX "comandas_numero_key";

-- AlterTable
ALTER TABLE "comandas" ALTER COLUMN "numero" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "pedido_itens" ALTER COLUMN "quantidade" DROP NOT NULL,
ALTER COLUMN "precoUnitario" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL;
