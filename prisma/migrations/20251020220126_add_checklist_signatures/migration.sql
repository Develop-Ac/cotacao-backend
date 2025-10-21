/*
  Warnings:

  - You are about to alter the column `veiculoKm` on the `Checklist` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "veiculoKm" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assinaturasclienteBase64" TEXT,
    "assinaturasresponsavelBase64" TEXT
);
INSERT INTO "new_Checklist" ("clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "updatedAt", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca") SELECT "clienteDoc", "clienteEnd", "clienteNome", "clienteTel", "combustivelPercentual", "createdAt", "dataHoraEntrada", "id", "observacoes", "osInterna", "updatedAt", "veiculoCor", "veiculoKm", "veiculoNome", "veiculoPlaca" FROM "Checklist";
DROP TABLE "Checklist";
ALTER TABLE "new_Checklist" RENAME TO "Checklist";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
