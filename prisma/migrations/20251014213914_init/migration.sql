-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "trash" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "cotacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cotacao_id" INTEGER,
    "orcamento_compra" TEXT
);

-- CreateTable
CREATE TABLE "item_cotacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER,
    "cotacao_id" INTEGER NOT NULL,
    "cod" TEXT,
    "descricao" TEXT,
    "marca" TEXT,
    "ref_fornecedor" TEXT,
    "unidade" TEXT,
    "quantidade" INTEGER DEFAULT 0,
    "valor_unitario" REAL,
    "selecionado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "item_cotacoes_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamento_cotacaos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orcamento_id" INTEGER,
    "cotacao_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "quantidade" INTEGER DEFAULT 0,
    "valor_unitario" REAL,
    "fornecedor" TEXT,
    "observacao" TEXT,
    "selecionado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "orcamento_cotacaos_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cotacoes_cotacao_id_key" ON "cotacoes"("cotacao_id");

-- CreateIndex
CREATE INDEX "item_cotacoes_cotacao_id_idx" ON "item_cotacoes"("cotacao_id");

-- CreateIndex
CREATE INDEX "orcamento_cotacaos_cotacao_id_idx" ON "orcamento_cotacaos"("cotacao_id");
