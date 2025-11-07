import { Test, TestingModule } from '@nestjs/testing';
import { EntregasRepository, EntregaRawData } from './entregas.repository';
import { PostgresService } from '../../shared/database/postgres/postgres.service';

describe('EntregasRepository', () => {
  let repository: EntregasRepository;
  let postgresService: any;

  const mockPostgresService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntregasRepository,
        {
          provide: PostgresService,
          useValue: mockPostgresService,
        },
      ],
    }).compile();

    repository = module.get<EntregasRepository>(EntregasRepository);
    postgresService = module.get<PostgresService>(PostgresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve executar query SQL e retornar entregas', async () => {
      const mockEntregas: EntregaRawData[] = [
        {
          id: 1,
          cliente: 'Cliente SQL Test',
          status: 'Pendente',
          id_entregador: null,
          venda: 'VENDA-SQL-001',
          criado_em: new Date('2024-11-07T10:00:00Z'),
          aceito_em: null,
          disponivel_para_entrega_em: null,
          saiu_para_entrega_em: null,
          finalizado_em: null,
          retorno_entregador_em: null,
          embalado_em: null,
        },
      ];

      mockPostgresService.query.mockResolvedValue(mockEntregas);

      const result = await repository.findAll();

      expect(postgresService.query).toHaveBeenCalledTimes(1);
      expect(postgresService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, cliente, status, id_entregador, venda')
      );
      expect(postgresService.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM public.exp_entregas')
      );
      expect(result).toEqual(mockEntregas);
    });

    it('deve retornar array vazio quando não há registros', async () => {
      mockPostgresService.query.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(postgresService.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('deve propagar erro do PostgreSQL', async () => {
      const errorMessage = 'Erro na execução da query SQL';
      mockPostgresService.query.mockRejectedValue(new Error(errorMessage));

      await expect(repository.findAll()).rejects.toThrow(errorMessage);
      expect(postgresService.query).toHaveBeenCalledTimes(1);
    });

    it('deve executar a query SQL correta', async () => {
      mockPostgresService.query.mockResolvedValue([]);

      await repository.findAll();

      const expectedQuery = expect.stringMatching(
        /SELECT id, cliente, status, id_entregador, venda,\s+criado_em, aceito_em, disponivel_para_entrega_em,\s+saiu_para_entrega_em, finalizado_em, retorno_entregador_em, embalado_em\s+FROM public\.exp_entregas;/
      );

      expect(postgresService.query).toHaveBeenCalledWith(expectedQuery);
    });
  });
});