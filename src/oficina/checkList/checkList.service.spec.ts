import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistsService } from '../../../src/oficina/checkList/checkList.service';
import { ChecklistRepository } from './checkList.repository';
import { CreateChecklistDto } from '../../../src/oficina/checkList/dto/create-checklist.dto';

describe('CheckListService', () => {
  let service: ChecklistsService;
  let repository: any;

  const mockCheckListRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByPlaca: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        {
          provide: ChecklistRepository,
          useValue: mockCheckListRepository,
        },
      ],
    }).compile();

    service = module.get<ChecklistsService>(ChecklistsService);
    repository = module.get<ChecklistRepository>(ChecklistRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um novo checklist', async () => {
      const createChecklistDto: CreateChecklistDto = {
        osInterna: 'OS-123',
        dataHoraEntrada: '2024-01-15T10:00:00Z',
        observacoes: 'Checklist de entrada',
        combustivelPercentual: 75,
        clienteNome: 'JOÃO DA SILVA',
        clienteDoc: '123.456.789-00',
        clienteTel: '(11) 99999-9999',
        clienteEnd: 'Rua das Flores, 123',
        veiculoNome: 'GOL',
        veiculoPlaca: 'ABC-1234',
        veiculoCor: 'BRANCO',
        veiculoKm: 50000,
        checklist: [
          {
            item: 'Verificar pressão dos pneus',
            status: 'OK',
          },
        ],
        avarias: [
          {
            tipo: 'RISCO',
            peca: 'PORTA',
            observacoes: 'Risco na porta do motorista',
            posX: 100,
            posY: 200,
            posZ: 0,
            normX: 1.0,
            normY: 0.0,
            normZ: 0.0,
            fotoBase64: null,
            timestamp: 1705312800000,
          },
        ],
      };

      const mockChecklistCreated = {
        id: 'checklist-123',
        osInterna: 'OS-123',
        dataHoraEntrada: new Date('2024-01-15T10:00:00Z'),
        observacoes: 'Checklist de entrada',
        combustivelPercentual: 75,
        clienteNome: 'JOÃO DA SILVA',
        clienteDoc: '123.456.789-00',
        clienteTel: '(11) 99999-9999',
        clienteEnd: 'Rua das Flores, 123',
        veiculoNome: 'GOL',
        veiculoPlaca: 'ABC-1234',
        veiculoCor: 'BRANCO',
        veiculoKm: BigInt(50000),
        assinaturasclienteBase64: null,
        assinaturasresponsavelBase64: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockResolvedValue(mockChecklistCreated);

      const result = await service.create(createChecklistDto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        osInterna: 'OS-123',
        dataHoraEntrada: expect.any(Date),
        observacoes: 'Checklist de entrada',
        combustivelPercentual: 75,
        clienteNome: 'JOÃO DA SILVA',
        clienteDoc: '123.456.789-00',
        clienteTel: '(11) 99999-9999',
        clienteEnd: 'Rua das Flores, 123',
        veiculoNome: 'GOL',
        veiculoPlaca: 'ABC-1234',
        veiculoCor: 'BRANCO',
        veiculoKm: expect.any(BigInt),
        assinaturasclienteBase64: null,
        assinaturasresponsavelBase64: null,
        ofi_checklists_items: expect.objectContaining({
          create: expect.arrayContaining([
            expect.objectContaining({
              item: 'Verificar pressão dos pneus',
              status: 'OK',
            })
          ])
        }),
        ofi_checklists_avarias: expect.objectContaining({
          create: expect.arrayContaining([
            expect.objectContaining({
              tipo: 'RISCO',
              peca: 'PORTA',
              observacoes: 'Risco na porta do motorista',
              posX: 100,
              posY: 200,
              posZ: 0,
              normX: 1.0,
              normY: 0.0,
              normZ: 0.0,
              fotoBase64: null,
              timestamp: expect.any(Date),
            })
          ])
        })
      }));
      expect(result).toEqual(mockChecklistCreated);
    });

    it('deve propagar erro do repository na criação', async () => {
      const createChecklistDto: CreateChecklistDto = {
        osInterna: 'OS-456',
        dataHoraEntrada: '2024-01-15T10:00:00Z',
        observacoes: 'Teste de erro',
        combustivelPercentual: 50,
        clienteNome: 'TESTE',
        clienteDoc: '000.000.000-00',
        clienteTel: '123456789',
        clienteEnd: 'Endereço teste',
        veiculoNome: 'TESTE',
        veiculoPlaca: 'XYZ-9999',
        veiculoCor: 'BRANCO',
        veiculoKm: 10000,
        checklist: [],
        avarias: [],
      };

      repository.create.mockRejectedValue(new Error('Erro na criação'));

      await expect(service.create(createChecklistDto)).rejects.toThrow('Erro na criação');
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de checklists', async () => {
      const page = 1;
      const limit = 10;
      const mockChecklists = [
        {
          id: 'checklist-123',
          data_criacao: new Date('2024-01-15T10:00:00Z'),
          cliente: {
            nome: 'JOÃO DA SILVA',
            telefone: '(11) 99999-9999',
          },
          veiculo: {
            placa: 'ABC-1234',
            marca: 'VOLKSWAGEN',
            modelo: 'GOL',
          },
        },
      ];

      const query = { page, pageSize: limit };
      
      // Mock do método transaction
      repository.transaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          ofi_checklists: {
            count: jest.fn().mockResolvedValue(mockChecklists.length),
            findMany: jest.fn().mockResolvedValue(mockChecklists)
          }
        };
        return await callback(tx);
      });

      const result = await service.findAll(query);

      expect(repository.transaction).toHaveBeenCalled();
      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: mockChecklists.length,
        totalPages: Math.ceil(mockChecklists.length / 10),
        data: mockChecklists,
      });
    });

    it('deve usar parâmetros padrão quando não especificados', async () => {
      const mockChecklists = [];
      const mockResult = {
        total: 0,
        page: 1,
        pageSize: 10,
        data: mockChecklists
      };

      // Mock do método transaction
      repository.transaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          ofi_checklists: {
            count: jest.fn().mockResolvedValue(0),
            findMany: jest.fn().mockResolvedValue(mockChecklists)
          }
        };
        return await callback(tx);
      });

      const result = await service.findAll({});

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        data: mockChecklists,
      });
    });
  });

  describe('findById', () => {
    it('deve retornar checklist por ID', async () => {
      const id = 'checklist-123';
      const mockChecklist = {
        id: 'checklist-123',
        osInterna: 'OS-123',
        dataHoraEntrada: new Date('2024-01-15T10:00:00Z'),
        observacoes: 'Checklist de entrada',
        combustivelPercentual: 75,
        clienteNome: 'JOÃO DA SILVA',
        veiculoPlaca: 'ABC-1234',
        veiculoNome: 'GOL',
        veiculoCor: 'BRANCO',
        veiculoKm: BigInt(50000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findUnique.mockResolvedValue(mockChecklist);

      const result = await service.findById(id);

      expect(repository.findUnique).toHaveBeenCalledWith({ id }, {
        ofi_checklists_items: true,
        ofi_checklists_avarias: true,
      });
      expect(result).toEqual(mockChecklist);
    });

    it('deve retornar null quando checklist não encontrado', async () => {
      const id = 'checklist-inexistente';

      repository.findUnique.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow('Checklist não encontrado');
    });
  });

  describe('findByPlaca', () => {
    it('deve retornar checklists por placa do veículo', async () => {
      const placa = 'ABC-1234';
      const mockChecklists = [
        {
          id: 'checklist-123',
          osInterna: 'OS-123',
          dataHoraEntrada: new Date('2024-01-15T10:00:00Z'),
          clienteNome: 'JOÃO DA SILVA',
          veiculoPlaca: 'ABC-1234',
          veiculoNome: 'GOL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.findMany.mockResolvedValue(mockChecklists);

      const result = await service.findByPlaca(placa);

      expect(repository.findMany).toHaveBeenCalledWith({
        where: {
          veiculoPlaca: {
            contains: 'ABC1234',
          },
        },
      });
      expect(result).toEqual(mockChecklists);
    });

    it('deve normalizar placa removendo caracteres especiais', async () => {
      const placa = 'ABC-1234';

      repository.findMany.mockResolvedValue([]);

      await service.findByPlaca(placa);

      expect(repository.findMany).toHaveBeenCalledWith({
        where: {
          veiculoPlaca: {
            contains: 'ABC1234',
          },
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar um checklist existente', async () => {
      const id = 'checklist-123';
      const updateData = {
        osInterna: 'OS-456',
        combustivelPercentual: 50,
        clienteNome: 'MARIA DA SILVA',
        veiculoKm: BigInt(60000),
        ofi_checklists_items: [
          { id: 'item-1', nome: 'Verificar óleo', status: 'OK' },
          { nome: 'Verificar freios', status: 'PENDENTE' },
        ],
        ofi_checklists_avarias: [
          { id: 'avaria-1', tipo: 'AMASSADO', peca: 'PARA-CHOQUE' },
          { tipo: 'RISCO', peca: 'PORTA' },
        ],
      };

      const mockUpdatedChecklist = {
        id,
        osInterna: 'OS-456',
        combustivelPercentual: 50,
        clienteNome: 'MARIA DA SILVA',
        veiculoKm: BigInt(60000),
        ofi_checklists_items: [
          { id: 'item-1', nome: 'Verificar óleo', status: 'OK' },
          { id: 'item-2', nome: 'Verificar freios', status: 'PENDENTE' },
        ],
        ofi_checklists_avarias: [
          { id: 'avaria-1', tipo: 'AMASSADO', peca: 'PARA-CHOQUE' },
          { id: 'avaria-2', tipo: 'RISCO', peca: 'PORTA' },
        ],
      };

      repository.update.mockResolvedValue(mockUpdatedChecklist);

      const result = await service.update(id, updateData);

      expect(repository.update).toHaveBeenCalledWith(
        { id },
        expect.objectContaining({
          osInterna: 'OS-456',
          combustivelPercentual: 50,
          clienteNome: 'MARIA DA SILVA',
          veiculoKm: expect.any(BigInt),
          ofi_checklists_items: expect.objectContaining({
            update: expect.arrayContaining([
              expect.objectContaining({
                where: { id: 'item-1' },
                data: expect.objectContaining({ nome: 'Verificar óleo', status: 'OK' }),
              }),
            ]),
            create: expect.arrayContaining([
              expect.objectContaining({ nome: 'Verificar freios', status: 'PENDENTE' }),
            ]),
          }),
          ofi_checklists_avarias: expect.objectContaining({
            update: expect.arrayContaining([
              expect.objectContaining({
                where: { id: 'avaria-1' },
                data: expect.objectContaining({ tipo: 'AMASSADO', peca: 'PARA-CHOQUE' }),
              }),
            ]),
            create: expect.arrayContaining([
              expect.objectContaining({ tipo: 'RISCO', peca: 'PORTA' }),
            ]),
          }),
        })
      );

      expect(result).toEqual(mockUpdatedChecklist);
    });
  });

  describe('delete', () => {
    it('deve deletar um checklist', async () => {
      const id = 'checklist-123';
      const mockExistingChecklist = {
        id: 'checklist-123',
        osInterna: 'OS-123',
        dataHoraEntrada: new Date('2024-01-15T10:00:00Z'),
        clienteNome: 'JOÃO DA SILVA',
        veiculoPlaca: 'ABC-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findUnique.mockResolvedValue(mockExistingChecklist);
      repository.delete.mockResolvedValue(undefined);

      const result = await service.delete(id);

      expect(repository.findUnique).toHaveBeenCalledWith({ id });
      expect(repository.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual({ ok: true });
    });

    it('deve propagar erro quando checklist não encontrado para deleção', async () => {
      const id = 'checklist-inexistente';

      repository.findUnique.mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow('Checklist não encontrado');
    });
  });
});