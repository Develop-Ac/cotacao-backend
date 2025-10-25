-- CreateTable
CREATE TABLE "com_cotacao_for" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa" INTEGER NOT NULL DEFAULT 3,
    "pedido_cotacao" INTEGER NOT NULL,
    "for_codigo" INTEGER NOT NULL,
    "for_nome" TEXT,
    "cpf_cnpj" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "com_cotacao_itens_for" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedido_cotacao" INTEGER NOT NULL,
    "for_codigo" INTEGER NOT NULL,
    "emissao" DATETIME,
    "pro_codigo" INTEGER NOT NULL,
    "pro_descricao" TEXT NOT NULL,
    "mar_descricao" TEXT,
    "referencia" TEXT,
    "unidade" TEXT,
    "quantidade" INTEGER NOT NULL,
    CONSTRAINT "com_cotacao_itens_for_pedido_cotacao_for_codigo_fkey" FOREIGN KEY ("pedido_cotacao", "for_codigo") REFERENCES "com_cotacao_for" ("pedido_cotacao", "for_codigo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "com_cotacao_for_pedido_cotacao_idx" ON "com_cotacao_for"("pedido_cotacao");

-- CreateIndex
CREATE UNIQUE INDEX "com_cotacao_for_pedido_cotacao_for_codigo_key" ON "com_cotacao_for"("pedido_cotacao", "for_codigo");

-- CreateIndex
CREATE INDEX "com_cotacao_itens_for_pedido_cotacao_for_codigo_idx" ON "com_cotacao_itens_for"("pedido_cotacao", "for_codigo");
