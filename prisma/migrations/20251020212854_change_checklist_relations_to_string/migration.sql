/*
  Warnings:

  - The primary key for the `Avaria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fotoBase64` on the `Avaria` table. All the data in the column will be lost.
  - The primary key for the `Checklist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChecklistItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Checklist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avaria" (
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
    "timestamp" DATETIME,
    CONSTRAINT "Avaria_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Avaria" ("checklistId", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "timestamp", "tipo") SELECT "checklistId", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "timestamp", "tipo" FROM "Avaria";
DROP TABLE "Avaria";
ALTER TABLE "new_Avaria" RENAME TO "Avaria";
CREATE INDEX "Avaria_checklistId_idx" ON "Avaria"("checklistId");
CREATE TABLE "new_Checklist" (
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
    "veiculoKm" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Checklist" ("clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca") SELECT "clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca" FROM "Checklist";
DROP TABLE "Checklist";
ALTER TABLE "new_Checklist" RENAME TO "Checklist";
CREATE TABLE "new_ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistItem" ("checklistId", "id", "item", "status") SELECT "checklistId", "id", "item", "status" FROM "ChecklistItem";
DROP TABLE "ChecklistItem";
ALTER TABLE "new_ChecklistItem" RENAME TO "ChecklistItem";
CREATE INDEX "ChecklistItem_checklistId_idx" ON "ChecklistItem"("checklistId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
