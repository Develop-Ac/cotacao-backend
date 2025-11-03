import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { ChecklistsModule } from './oficina/checkList/checklist.module';
import { GenerateChecklistPdfModule } from './oficina/checkList/pdf/generate-pdf.module';
import { OpenQueryHttpModule } from './compras/cotacao/openquery/openquery.module';
import { CotacaoModule } from './compras/cotacao/cotacao.module';
import { FornecedorModule } from './compras/cotacao/fornecedor/fornecedor.module';
import { CotacaoSyncModule } from './compras/cotacao/cotacao-sync/cotacao-sync.module';
import { UtilsModule } from './utils/utils.module';
import { OrdemServicoModule } from './oficina/checkList/ordem-servico/ordem-servico.module';
import { ImagesModule } from './oficina/checkList/img/img.module';
import { PedidoModule } from './compras/cotacao/pedido/pedido.module';
import { S3Module } from './storage/s3.module';
import { UploadsModule } from './oficina/s3/s3.module';

@Module({
imports: [
    UsuarioModule,
    PrismaModule,
    LoginModule,
    ChecklistsModule,
    GenerateChecklistPdfModule,
    ImagesModule,
    OpenQueryHttpModule,
    CotacaoModule,
    FornecedorModule,
    CotacaoSyncModule,
    // UtilsModule,
    OrdemServicoModule,
    PedidoModule,
    S3Module,
    UploadsModule,

    // ⬇️ Prefixa *somente* esses módulos com /compras
    RouterModule.register([
      { path: 'oficina', module: ChecklistsModule },
      { path: 'oficina', module: GenerateChecklistPdfModule },
      { path: 'oficina', module: OrdemServicoModule },
      { path: 'oficina', module: ImagesModule },
      { path: 'oficina', module: UploadsModule },
      { path: 'compras', module: OpenQueryHttpModule }, 
      { path: 'compras', module: CotacaoModule }, 
      { path: 'compras', module: FornecedorModule },
      { path: 'compras', module: CotacaoSyncModule },
      { path: 'compras', module: PedidoModule }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
