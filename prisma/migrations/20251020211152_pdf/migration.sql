/*
  Warnings:

  - The primary key for the `Avaria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `checklistId` on the `Avaria` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Avaria` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Checklist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assinaturaClienteBase64` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `assinaturaResponsavelBase64` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `capturaCarroBase64` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `capturaPaginaBase64` on the `Checklist` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Checklist` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ChecklistItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `checklistId` on the `ChecklistItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `ChecklistItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avaria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checklistId" INTEGER NOT NULL,
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
    CONSTRAINT "Avaria_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avaria" ("checklistId", "fotoBase64", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "timestamp", "tipo") SELECT "checklistId", "fotoBase64", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "timestamp", "tipo" FROM "Avaria";
DROP TABLE "Avaria";
ALTER TABLE "new_Avaria" RENAME TO "Avaria";
CREATE TABLE "new_Checklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "osInterna" TEXT,
    "dataHoraEntrada" DATETIME,
    "combustivelPercentual" INTEGER,
    "observacoes" TEXT,
    "clienteNome" TEXT,
    "clienteDoc" TEXT,
    "clienteTel" TEXT,
    "clienteEnd" TEXT,
    "veiculoNome" TEXT,
    "veiculoPlaca" TEXT,
    "veiculoCor" TEXT,
    "veiculoKm" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Checklist" ("clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca") SELECT "clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca" FROM "Checklist";
DROP TABLE "Checklist";
ALTER TABLE "new_Checklist" RENAME TO "Checklist";
CREATE TABLE "new_ChecklistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checklistId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistItem" ("checklistId", "id", "item", "status") SELECT "checklistId", "id", "item", "status" FROM "ChecklistItem";
DROP TABLE "ChecklistItem";
ALTER TABLE "new_ChecklistItem" RENAME TO "ChecklistItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
