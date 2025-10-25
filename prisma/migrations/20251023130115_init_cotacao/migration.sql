/*
  Warnings:

  - You are about to drop the `com_cotacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `com_item_cotacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `com_orcamento_cotacaos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "com_cotacoes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "com_item_cotacoes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "com_orcamento_cotacaos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "com_cotacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa" INTEGER NOT NULL,
    "pedido_cotacao" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "com_cotacao_itens" (
    "pedido_cotacao" INTEGER NOT NULL,
    "emissao" DATETIME,
    "pro_codigo" INTEGER NOT NULL,
    "pro_descricao" TEXT NOT NULL,
    "mar_descricao" TEXT,
    "referencia" TEXT,
    "unidade" TEXT,
    "quantidade" INTEGER NOT NULL,

    PRIMARY KEY ("pedido_cotacao", "pro_codigo"),
    CONSTRAINT "com_cotacao_itens_pedido_cotacao_fkey" FOREIGN KEY ("pedido_cotacao") REFERENCES "com_cotacao" ("pedido_cotacao") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "com_cotacao_pedido_cotacao_key" ON "com_cotacao"("pedido_cotacao");
