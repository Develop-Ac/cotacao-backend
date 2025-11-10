import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistRepository } from './checkList.repository';
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
  constructor(private readonly repo: ChecklistRepository) {}

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

    return this.repo.create({
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
      veiculoKm: veiculoKmBig,

      assinaturasclienteBase64: assinaturaCliente,
      assinaturasresponsavelBase64: assinaturaResponsavel,

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

// TIPAR explicitamente o where evita inferência ruim do TS

const where: Prisma.ofi_checklistsWhereInput | undefined = search
  ? {
      OR: [
        { osInterna: { contains: search } },
        { clienteNome: { contains: search } },
        { veiculoPlaca: { contains: search } },
      ],
    }
  : undefined;

    const [total, data] = await this.repo.transaction(async (tx) => {
      const count = await tx.ofi_checklists.count({ where });
      const items = await tx.ofi_checklists.findMany({
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
      });
      return [count, items] as const;
    });

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
    const item = await this.repo.findUnique({ id }, {
      ofi_checklists_items: true,
      ofi_checklists_avarias: true,
    });

    if (!item) {
      throw new NotFoundException('Checklist não encontrado');
    }
    return item;
  }

  /** DELETE */
  async remove(id: string) {
    // garante que existe antes de excluir
    const exists = await this.repo.findUnique({ id });
    if (!exists) throw new NotFoundException('Checklist não encontrado');

    await this.repo.delete({ id });
    return { ok: true };
  }

  /** UPDATE */
  async update(id: string, data: any) {
    const exists = await this.repo.findUnique({ id });
    if (!exists) throw new NotFoundException('Checklist não encontrado');

    // Remover campos inválidos
    const { checklistId, ...validData } = data;

    // Processar itens relacionados
    if (validData.ofi_checklists_items) {
      validData.ofi_checklists_items = {
        update: validData.ofi_checklists_items.map((item: any) => {
          const { checklistId, ...validItem } = item; // Remover checklistId
          return {
            where: { id: validItem.id },
            data: { ...validItem },
          };
        }),
        create: validData.ofi_checklists_items 
          .filter((item: any) => !item.id) // Apenas itens sem ID serão criados
          .map((item: any) => {
            const { checklistId, ...validItem } = item; // Remover checklistId
            return { ...validItem };
          }),
      };
    }

    // Processar avarias relacionadas
    if (validData.ofi_checklists_avarias) {
      validData.ofi_checklists_avarias = {
        update: validData.ofi_checklists_avarias.map((avaria: any) => {
          const { checklistId, ...validAvaria } = avaria; // Remover checklistId
          return {
            where: { id: validAvaria.id },
            data: { ...validAvaria },
          };
        }),
        create: validData.ofi_checklists_avarias
          .filter((avaria: any) => !avaria.id) // Apenas avarias sem ID serão criadas
          .map((avaria: any) => {
            const { checklistId, ...validAvaria } = avaria; // Remover checklistId
            return { ...validAvaria };
          }),
      }; 
    }
  
    // Atualizar checklist principal
    const updatedChecklist = await this.repo.update({ id }, validData);

    return updatedChecklist;
  }

  // Aliases para compatibilidade com os testes
  async findById(id: string) {
    return this.findOne(id);
  }

  async delete(id: string) {
    return this.remove(id);
  }

  async findByPlaca(placa: string) {
    const normalizedPlaca = placa.replace(/[-\s]/g, '');
    return this.repo.findMany({
      where: {
        veiculoPlaca: {
          contains: normalizedPlaca,
        },
      },
    });
  }

  async findByOs(os: string) {
    const item = await this.repo.findFirst(
      { where: { osInterna: os } },
      {
        ofi_checklists_items: true,
        ofi_checklists_avarias: true,
      }
    );
    if (!item) throw new NotFoundException('Checklist não encontrado');
    return item;
  }
}