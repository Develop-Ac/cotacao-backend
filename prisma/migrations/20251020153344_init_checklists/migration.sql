-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "osInterna" TEXT,
    "dataHoraEntrada" DATETIME,
    "observacoes" TEXT,
    "combustivelPercentual" INTEGER NOT NULL DEFAULT 0,
    "assinaturaClienteBase64" TEXT,
    "assinaturaResponsavelBase64" TEXT,
    "capturaCarroBase64" TEXT,
    "capturaPaginaBase64" TEXT,
    "clienteId" TEXT,
    "veiculoId" TEXT,
    CONSTRAINT "Checklist_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Checklist_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT,
    "doc" TEXT,
    "tel" TEXT,
    "end" TEXT
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT,
    "placa" TEXT,
    "cor" TEXT,
    "km" INTEGER
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaria" (
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
    "registradoEm" DATETIME,
    CONSTRAINT "Avaria_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
