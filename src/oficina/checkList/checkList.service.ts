import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { Prisma } from '@prisma/client';

type ListQuery = {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  orderBy?: 'createdAt' | 'dataHoraEntrada';
  orderDir?: 'asc' | 'desc';
};

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  /** CREATE */
  async create(body: CreateChecklistDto) {
    // normaliza KM para BigInt (se seu schema é BigInt?)
    let veiculoKmBig: bigint | null = null;
    if (body.veiculoKm !== undefined && body.veiculoKm !== null) {
      // body.veiculoKm pode chegar como number | null (se DTO usa Transform) – convertemos para BigInt com segurança
      const kmNum = Math.trunc(Number(body.veiculoKm));
      if (!Number.isNaN(kmNum)) {
        veiculoKmBig = BigInt(kmNum);
      }
    }

    // assinaturas (aceita nomes antigos também)
    const assinaturaCliente =
      body.assinaturasclienteBase64 ?? body.assinaturaClienteBase64 ?? null;

    const assinaturaResponsavel =
      body.assinaturasresponsavelBase64 ?? body.assinaturaResponsavelBase64 ?? null;

    return this.prisma.ofi_checklists.create({
      data: {
        osInterna: body.osInterna ?? null,
        dataHoraEntrada: body.dataHoraEntrada ? new Date(body.dataHoraEntrada) : null,
        observacoes: body.observacoes ?? null,
        combustivelPercentual: body.combustivelPercentual ?? null,

        clienteNome: body.clienteNome ?? null,
        clienteDoc: body.clienteDoc ?? null,
        clienteTel: body.clienteTel ?? null,
        clienteEnd: body.clienteEnd ?? null,

        veiculoNome: body.veiculoNome ?? null,
        veiculoPlaca: body.veiculoPlaca ?? null,
        veiculoCor: body.veiculoCor ?? null,
        veiculoKm: veiculoKmBig, // se seu schema for Int?, troque para Number(...) ou ajuste o schema

        // novos campos
        assinaturasclienteBase64: assinaturaCliente,
        assinaturasresponsavelBase64: assinaturaResponsavel,

        // relacionamentos
        ofi_checklists_items: body.checklist?.length
          ? {
              create: body.checklist.map((i) => ({
                item: i.item,
                status: i.status,
              })),
            }
          : undefined,

        ofi_checklists_avarias: body.avarias?.length
          ? {
              create: body.avarias.map((a) => ({
                tipo: a.tipo ?? null,
                peca: a.peca ?? null,
                observacoes: a.observacoes ?? null,
                posX: a.posX ?? null,
                posY: a.posY ?? null,
                posZ: a.posZ ?? null,
                normX: a.normX ?? null,
                normY: a.normY ?? null,
                normZ: a.normZ ?? null,
                fotoBase64: a.fotoBase64 ?? null,
                timestamp: a.timestamp ? new Date(a.timestamp) : null,
              })),
            }
          : undefined,
      },
    });
  }

  /** LIST (com paginação + busca) */
  async findAll(query: ListQuery) {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 10)));
    const skip = (page - 1) * pageSize;

    const search = (query.search ?? '').toString().trim();
    const orderByField = (query.orderBy ?? 'createdAt') as
      | 'createdAt'
      | 'dataHoraEntrada';
    const orderDir = (query.orderDir ?? 'desc') as 'asc' | 'desc';

    // CORREÇÃO: Usar a string literal 'insensitive' para o modo de consulta
    const insensitive = 'insensitive' as const;

    // TIPAR explicitamente o where evita inferência ruim do TS

const where: Prisma.ofi_checklistsWhereInput | undefined = search
  ? {
      OR: [
        { osInterna:  { contains: search }, },
        { clienteNome:{ contains: search }, },
        { veiculoPlaca:{ contains: search, } },
      ],
    }
  : undefined;

const rows = await this.prisma.ofi_checklists.findMany({
  where,
  orderBy: { createdAt: 'desc' },
  take: 50,
});

    const [total, data] = await this.prisma.$transaction([
      this.prisma.ofi_checklists.count({ where }),
      this.prisma.ofi_checklists.findMany({
        where,
        orderBy: { [orderByField]: orderDir },
        skip,
        take: pageSize,
        select: {
          id: true,
          osInterna: true,
          dataHoraEntrada: true,
          observacoes: true,
          combustivelPercentual: true,
          clienteNome: true,
          veiculoPlaca: true,
          veiculoNome: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data,
    };
  }

  /** GET BY ID (com relacionamentos) */
  async findOne(id: string) {
    const item = await this.prisma.ofi_checklists.findUnique({
      where: { id },
      include: {
        ofi_checklists_items: true,
        ofi_checklists_avarias: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Checklist não encontrado');
    }
    return item;
  }

  /** DELETE */
  async remove(id: string) {
    // garante que existe antes de excluir
    const exists = await this.prisma.ofi_checklists.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Checklist não encontrado');

    await this.prisma.ofi_checklists.delete({ where: { id } });
    return { ok: true };
  }
}