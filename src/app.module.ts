import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { CotacaoModule } from './compras/cotacao/cotacao.module';
import { OrcamentoCotacaoModule } from './compras/orcamentoCotacao/orcamentoCotacao.module';
import { ChecklistsModule } from './oficina/checkList/checklist.module';
import { GenerateChecklistPdfModule } from './oficina/checkListPdf/generate-pdf.module';

@Module({
imports: [
    UsuarioModule,
    PrismaModule,
    LoginModule,
    CotacaoModule,
    OrcamentoCotacaoModule,
    ChecklistsModule,
    GenerateChecklistPdfModule,

    // ⬇️ Prefixa *somente* esses módulos com /compras
    RouterModule.register([
      { path: 'compras', module: CotacaoModule },
      { path: 'compras', module: OrcamentoCotacaoModule },
      { path: 'oficina', module: ChecklistsModule },
      { path: 'oficina', module: GenerateChecklistPdfModule },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
