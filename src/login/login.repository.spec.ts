import { Test, TestingModule } from '@nestjs/testing';
import { LoginRepository } from './login.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('LoginRepository', () => {
  let repository: LoginRepository;
  let prismaService: any;

  const mockPrismaService = {
    sis_usuarios: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<LoginRepository>(LoginRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsuarioByCodigo', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const codigo = 'JS001';
      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      prismaService.sis_usuarios.findUnique.mockResolvedValue(mockUsuario);

      const result = await repository.findUsuarioByCodigo(codigo);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { codigo },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      const codigo = 'USER_INEXISTENTE';

      prismaService.sis_usuarios.findUnique.mockResolvedValue(null);

      const result = await repository.findUsuarioByCodigo(codigo);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { codigo },
      });
      expect(result).toBeNull();
    });

    it('deve filtrar usuários com trash = 0', async () => {
      const codigo = 'JS001';

      prismaService.sis_usuarios.findUnique.mockResolvedValue(null);

      const result = await repository.findUsuarioByCodigo(codigo);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { codigo },
      });
    });

    it('deve propagar erro do Prisma', async () => {
      const codigo = 'JS001';
      const error = new Error('Erro de conexão com banco de dados');

      prismaService.sis_usuarios.findUnique.mockRejectedValue(error);

      await expect(repository.findUsuarioByCodigo(codigo)).rejects.toThrow('Erro de conexão com banco de dados');
    });

    it('deve buscar por código exato (case sensitive)', async () => {
      const codigo = 'js001'; // minúsculo
      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'js001',
        setor: 'ESTOQUE',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      prismaService.sis_usuarios.findUnique.mockResolvedValue(mockUsuario);

      const result = await repository.findUsuarioByCodigo(codigo);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'js001' },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('deve ignorar usuários removidos (trash = 1)', async () => {
      const codigo = 'JS001';

      // Simulando que o usuário existe mas está marcado como removido
      prismaService.sis_usuarios.findUnique.mockResolvedValue(null);

      const result = await repository.findUsuarioByCodigo(codigo);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { codigo },
      });
      expect(result).toBeNull();
    });
  });
});