/*
  Warnings:

  - You are about to drop the `Avaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Checklist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cotacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item_cotacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orcamento_cotacaos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Avaria";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Checklist";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ChecklistItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cotacoes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "item_cotacoes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "orcamento_cotacaos";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "usuarios";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "com_usuarios" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "trash" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "com_cotacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cotacao_id" INTEGER,
    "orcamento_compra" TEXT
);

-- CreateTable
CREATE TABLE "com_item_cotacoes" (
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
    CONSTRAINT "com_item_cotacoes_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "com_cotacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "com_orcamento_cotacaos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orcamento_id" INTEGER,
    "cotacao_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "quantidade" INTEGER DEFAULT 0,
    "valor_unitario" REAL,
    "fornecedor" TEXT,
    "observacao" TEXT,
    "selecionado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "com_orcamento_cotacaos_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "com_cotacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ofi_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "osInterna" TEXT,
    "dataHoraEntrada" DATETIME,
    "observacoes" TEXT,
    "combustivelPercentual" INTEGER,
    "clienteNome" TEXT,
    "clienteDoc" TEXT,
    "clienteTel" TEXT,
    "clienteEnd" TEXT,
    "veiculoNome" TEXT,
    "veiculoPlaca" TEXT,
    "veiculoCor" TEXT,
    "veiculoKm" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assinaturasclienteBase64" TEXT,
    "assinaturasresponsavelBase64" TEXT
);

-- CreateTable
CREATE TABLE "ofi_checklists_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ofi_checklists_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "ofi_checklists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ofi_checklists_avarias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "tipo" TEXT,
    "peca" TEXT,
    "observacoes" TEXT,
    "posX" REAL,
    "posY" REAL,
    "posZ" REAL,
    "normX" REAL,
    "normY" REAL,
    "normZ" REAL,
    "fotoBase64" TEXT,
    "timestamp" DATETIME,
    CONSTRAINT "ofi_checklists_avarias_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "ofi_checklists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "com_usuarios_email_key" ON "com_usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "com_cotacoes_cotacao_id_key" ON "com_cotacoes"("cotacao_id");

-- CreateIndex
CREATE INDEX "com_item_cotacoes_cotacao_id_idx" ON "com_item_cotacoes"("cotacao_id");

-- CreateIndex
CREATE INDEX "com_orcamento_cotacaos_cotacao_id_idx" ON "com_orcamento_cotacaos"("cotacao_id");

-- CreateIndex
CREATE INDEX "ofi_checklists_items_checklistId_idx" ON "ofi_checklists_items"("checklistId");

-- CreateIndex
CREATE INDEX "ofi_checklists_avarias_checklistId_idx" ON "ofi_checklists_avarias"("checklistId");
