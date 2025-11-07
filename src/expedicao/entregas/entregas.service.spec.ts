import { Test, TestingModule } from '@nestjs/testing';
import { EntregasService } from './entregas.service';
import { EntregasRepository, EntregaRawData } from './entregas.repository';

describe('EntregasService', () => {
  let service: EntregasService;
  let repository: any;

  const mockEntregasRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntregasService,
        {
          provide: EntregasRepository,
          useValue: mockEntregasRepository,
        },
      ],
    }).compile();

    service = module.get<EntregasService>(EntregasService);
    repository = module.get<EntregasRepository>(EntregasRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar lista de todas as entregas', async () => {
      const mockEntregasRaw: EntregaRawData[] = [
        {
          id: 1,
          cliente: 'Cliente Teste 1',
          status: 'Em andamento',
          id_entregador: 123,
          venda: 'VENDA-001',
          criado_em: new Date('2024-11-07T10:00:00Z'),
          aceito_em: new Date('2024-11-07T10:15:00Z'),
          disponivel_para_entrega_em: new Date('2024-11-07T11:00:00Z'),
          saiu_para_entrega_em: new Date('2024-11-07T12:00:00Z'),
          finalizado_em: null,
          retorno_entregador_em: null,
          embalado_em: new Date('2024-11-07T09:30:00Z'),
        },
        {
          id: 2,
          cliente: 'Cliente Teste 2',
          status: 'Finalizada',
          id_entregador: 456,
          venda: 'VENDA-002',
          criado_em: new Date('2024-11-06T08:00:00Z'),
          aceito_em: new Date('2024-11-06T08:30:00Z'),
          disponivel_para_entrega_em: new Date('2024-11-06T09:00:00Z'),
          saiu_para_entrega_em: new Date('2024-11-06T10:00:00Z'),
          finalizado_em: new Date('2024-11-06T14:00:00Z'),
          retorno_entregador_em: new Date('2024-11-06T15:00:00Z'),
          embalado_em: new Date('2024-11-06T07:30:00Z'),
        },
      ];

      mockEntregasRepository.findAll.mockResolvedValue(mockEntregasRaw);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        cliente: 'Cliente Teste 1',
        status: 'Em andamento',
        id_entregador: 123,
        venda: 'VENDA-001',
        criado_em: new Date('2024-11-07T10:00:00Z'),
        aceito_em: new Date('2024-11-07T10:15:00Z'),
        disponivel_para_entrega_em: new Date('2024-11-07T11:00:00Z'),
        saiu_para_entrega_em: new Date('2024-11-07T12:00:00Z'),
        finalizado_em: null,
        retorno_entregador_em: null,
        embalado_em: new Date('2024-11-07T09:30:00Z'),
      });
      expect(result[1]).toEqual({
        id: 2,
        cliente: 'Cliente Teste 2',
        status: 'Finalizada',
        id_entregador: 456,
        venda: 'VENDA-002',
        criado_em: new Date('2024-11-06T08:00:00Z'),
        aceito_em: new Date('2024-11-06T08:30:00Z'),
        disponivel_para_entrega_em: new Date('2024-11-06T09:00:00Z'),
        saiu_para_entrega_em: new Date('2024-11-06T10:00:00Z'),
        finalizado_em: new Date('2024-11-06T14:00:00Z'),
        retorno_entregador_em: new Date('2024-11-06T15:00:00Z'),
        embalado_em: new Date('2024-11-06T07:30:00Z'),
      });
    });

    it('deve retornar lista vazia quando não há entregas', async () => {
      mockEntregasRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('deve propagar erro do repository', async () => {
      const errorMessage = 'Erro de conexão com o banco de dados';
      mockEntregasRepository.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAll()).rejects.toThrow(errorMessage);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});