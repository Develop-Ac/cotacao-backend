/*
  Warnings:

  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "usuario";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "com_usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "trash" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "com_usuario_email_key" ON "com_usuario"("email");
