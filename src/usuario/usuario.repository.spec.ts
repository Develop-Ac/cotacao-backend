import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;
  let prismaService: any;

  const mockPrismaService = {
    sis_usuarios: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsuarioRepository>(UsuarioRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários ativos', async () => {
      const mockUsuarios = [
        {
          id: 'user-123',
          nome: 'JOÃO DA SILVA',
          codigo: 'JS001',
          setor: 'ESTOQUE',
          senha: '$2b$10$hashedPassword',
          trash: 0,
        },
        {
          id: 'user-456',
          nome: 'MARIA SANTOS',
          codigo: 'MS002',
          setor: 'VENDAS',
          senha: '$2b$10$anotherHashedPassword',
          trash: 0,
        },
      ];

      prismaService.sis_usuarios.findMany.mockResolvedValue(mockUsuarios);

      const result = await repository.findAll();

      expect(prismaService.sis_usuarios.findMany).toHaveBeenCalledWith({
        where: { trash: 0 },
        select: {
          id: true,
          nome: true,
          setor: true,
          codigo: true,
          trash: true,
        },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockUsuarios);
    });

    it('deve propagar erro do Prisma', async () => {
      prismaService.sis_usuarios.findMany.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(repository.findAll()).rejects.toThrow('Erro de banco de dados');
    });
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const createData = {
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      const mockUsuarioCreated = {
        id: 'user-789',
        ...createData,
      };

      prismaService.sis_usuarios.create.mockResolvedValue(mockUsuarioCreated);

      const result = await repository.create(createData);

      expect(prismaService.sis_usuarios.create).toHaveBeenCalledWith({
        data: createData,
        select: { id: true, nome: true, setor: true },
      });
      expect(result).toEqual(mockUsuarioCreated);
    });

    it('deve lançar ConflictException quando código já existe', async () => {
      const createData = {
        nome: 'USUÁRIO DUPLICADO',
        codigo: 'UD001',
        setor: 'TI',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      const prismaError = new Error('Unique constraint failed') as any;
      prismaError.code = 'P2002';
      prismaError.meta = { target: ['codigo'] };

      prismaService.sis_usuarios.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow('Unique constraint failed');
    });

    it('deve propagar outros erros do Prisma', async () => {
      const createData = {
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      const prismaError = new Error('Erro de conexão');
      prismaService.sis_usuarios.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow('Erro de conexão');
    });
  });

  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const id = 'user-123';
      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      prismaService.sis_usuarios.findUnique.mockResolvedValue(mockUsuario);

      const result = await repository.findById(id);

      expect(prismaService.sis_usuarios.findUnique).toHaveBeenCalledWith({
        where: { id, trash: 0 },
        select: {
          id: true,
          nome: true,
          setor: true,
          codigo: true,
        },
      });
      expect(result).toEqual(mockUsuario);
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      const id = 'user-inexistente';

      prismaService.sis_usuarios.findUnique.mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });

    it('deve propagar erro do Prisma', async () => {
      const id = 'user-123';

      prismaService.sis_usuarios.findUnique.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(repository.findById(id)).rejects.toThrow('Erro de banco de dados');
    });
  });

  describe('update', () => {
    it('deve atualizar usuário existente', async () => {
      const id = 'user-123';
      const updateData = {
        nome: 'JOÃO DA SILVA SANTOS',
        setor: 'GERÊNCIA',
      };

      const mockUsuarioUpdated = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA SANTOS',
        codigo: 'JS001',
        setor: 'GERÊNCIA',
        senha: '$2b$10$hashedPassword',
        trash: 0,
      };

      prismaService.sis_usuarios.update.mockResolvedValue(mockUsuarioUpdated);

      const result = await repository.update(id, updateData);

      expect(prismaService.sis_usuarios.update).toHaveBeenCalledWith({
        where: { id, trash: 0 },
        data: updateData,
        select: { id: true, nome: true, setor: true, codigo: true },
      });
      expect(result).toEqual(mockUsuarioUpdated);
    });

    it('deve lançar NotFoundException quando usuário não encontrado', async () => {
      const id = 'user-inexistente';
      const updateData = { nome: 'NOME NOVO' };

      const prismaError = new Error('Record not found') as any;
      prismaError.code = 'P2025';

      prismaService.sis_usuarios.update.mockRejectedValue(prismaError);

      await expect(repository.update(id, updateData)).rejects.toThrow('Record not found');
    });

    it('deve lançar ConflictException quando código já existe', async () => {
      const id = 'user-123';
      const updateData = { codigo: 'CODIGO_EXISTENTE' };

      const prismaError = new Error('Unique constraint failed') as any;
      prismaError.code = 'P2002';
      prismaError.meta = { target: ['codigo'] };

      prismaService.sis_usuarios.update.mockRejectedValue(prismaError);

      await expect(repository.update(id, updateData)).rejects.toThrow('Unique constraint failed');
    });

    it('deve propagar outros erros do Prisma', async () => {
      const id = 'user-123';
      const updateData = { nome: 'NOME NOVO' };

      prismaService.sis_usuarios.update.mockRejectedValue(new Error('Erro de conexão'));

      await expect(repository.update(id, updateData)).rejects.toThrow('Erro de conexão');
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft delete do usuário', async () => {
      const id = 'user-123';
      const mockUsuarioDeleted = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: '$2b$10$hashedPassword',
        trash: 1,
      };

      prismaService.sis_usuarios.update.mockResolvedValue(mockUsuarioDeleted);

      const result = await repository.softDelete(id);

      expect(prismaService.sis_usuarios.update).toHaveBeenCalledWith({
        where: { id, trash: 0 },
        data: { trash: 1 },
        select: { id: true, nome: true, setor: true },
      });
      expect(result).toEqual(mockUsuarioDeleted);
    });

    it('deve lançar NotFoundException quando usuário não encontrado', async () => {
      const id = 'user-inexistente';

      const prismaError = new Error('Record not found') as any;
      prismaError.code = 'P2025';

      prismaService.sis_usuarios.update.mockRejectedValue(prismaError);

      await expect(repository.softDelete(id)).rejects.toThrow('Record not found');
    });

    it('deve propagar outros erros do Prisma', async () => {
      const id = 'user-123';

      prismaService.sis_usuarios.update.mockRejectedValue(new Error('Erro de conexão'));

      await expect(repository.softDelete(id)).rejects.toThrow('Erro de conexão');
    });
  });
});