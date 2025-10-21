/*
  Warnings:

  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Veiculo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `registradoEm` on the `Avaria` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `veiculoId` on the `Checklist` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Cliente";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Veiculo";
PRAGMA foreign_keys=on;

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
    "fotoBase64" TEXT,
    "timestamp" DATETIME,
    CONSTRAINT "Avaria_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avaria" ("checklistId", "fotoBase64", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "tipo") SELECT "checklistId", "fotoBase64", "id", "normX", "normY", "normZ", "observacoes", "peca", "posX", "posY", "posZ", "tipo" FROM "Avaria";
DROP TABLE "Avaria";
ALTER TABLE "new_Avaria" RENAME TO "Avaria";
CREATE TABLE "new_Checklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "osInterna" TEXT,
    "dataHoraEntrada" DATETIME,
    "observacoes" TEXT,
    "combustivelPercentual" INTEGER NOT NULL DEFAULT 0,
    "clienteNome" TEXT,
    "clienteDoc" TEXT,
    "clienteTel" TEXT,
    "clienteEnd" TEXT,
    "veiculoNome" TEXT,
    "veiculoPlaca" TEXT,
    "veiculoCor" TEXT,
    "veiculoKm" INTEGER,
    "assinaturaClienteBase64" TEXT,
    "assinaturaResponsavelBase64" TEXT,
    "capturaCarroBase64" TEXT,
    "capturaPaginaBase64" TEXT
);
INSERT INTO "new_Checklist" ("assinaturaClienteBase64", "assinaturaResponsavelBase64", "capturaCarroBase64", "capturaPaginaBase64", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna") SELECT "assinaturaClienteBase64", "assinaturaResponsavelBase64", "capturaCarroBase64", "capturaPaginaBase64", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna" FROM "Checklist";
DROP TABLE "Checklist";
ALTER TABLE "new_Checklist" RENAME TO "Checklist";
CREATE TABLE "new_ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistItem" ("checklistId", "id", "item", "status") SELECT "checklistId", "id", "item", "status" FROM "ChecklistItem";
DROP TABLE "ChecklistItem";
ALTER TABLE "new_ChecklistItem" RENAME TO "ChecklistItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
