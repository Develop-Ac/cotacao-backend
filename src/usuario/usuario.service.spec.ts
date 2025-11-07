import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsuarioService, CreateUsuarioInput } from './usuario.service';
import { UsuarioRepository } from './usuario.repository';
import * as bcrypt from 'bcryptjs';

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: any;
  let bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  const mockUsuarioRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: UsuarioRepository,
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<UsuarioRepository>(UsuarioRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar lista de todos os usuários', async () => {
      const mockUsuarios = [
        {
          id: 'user-123',
          nome: 'JOÃO DA SILVA',
          codigo: 'JS001',
          setor: 'ESTOQUE',
          trash: 0,
        },
        {
          id: 'user-456',
          nome: 'MARIA SANTOS',
          codigo: 'MS002',
          setor: 'VENDAS',
          trash: 0,
        },
      ];

      repository.findAll.mockResolvedValue(mockUsuarios);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsuarios);
    });

    it('deve propagar erro do repository', async () => {
      repository.findAll.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(service.findAll()).rejects.toThrow('Erro de banco de dados');
    });
  });

  describe('create', () => {
    it('deve criar um novo usuário com senha hasheada', async () => {
      const createUsuarioInput: CreateUsuarioInput = {
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: 'senha123',
      };

      const senhaHash = '$2b$10$hashedPassword';
      const mockUsuarioCreated = {
        id: 'user-789',
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: senhaHash,
        trash: 0,
      };

      bcryptMock.hash.mockResolvedValue(senhaHash as never);
      repository.create.mockResolvedValue(mockUsuarioCreated);

      const result = await service.create(createUsuarioInput);

      expect(bcryptMock.hash).toHaveBeenCalledWith('senha123', 10);
      expect(repository.create).toHaveBeenCalledWith({
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: senhaHash,
        trash: 0,
      });
      expect(result).toEqual({
        message: 'Usuário criado com sucesso!',
        data: mockUsuarioCreated,
      });
    });

    it('deve propagar ConflictException do repository', async () => {
      const createUsuarioInput: CreateUsuarioInput = {
        nome: 'USUÁRIO DUPLICADO',
        codigo: 'UD001',
        setor: 'TI',
        senha: 'senha123',
      };

      const senhaHash = '$2b$10$hashedPassword';
      bcryptMock.hash.mockResolvedValue(senhaHash as never);
      repository.create.mockRejectedValue(new ConflictException('Código já existe'));

      await expect(service.create(createUsuarioInput)).rejects.toThrow('Código já existe');
    });

    it('deve propagar erro de hash do bcrypt', async () => {
      const createUsuarioInput: CreateUsuarioInput = {
        nome: 'NOVO USUÁRIO',
        codigo: 'NU001',
        setor: 'TI',
        senha: 'senha123',
      };

      bcryptMock.hash.mockRejectedValue(new Error('Erro no hash') as never);

      await expect(service.create(createUsuarioInput)).rejects.toThrow('Erro no hash');
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
        trash: 0,
      };

      repository.findById.mockResolvedValue(mockUsuario);

      const result = await service.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUsuario);
    });

    it('deve lançar NotFoundException quando usuário não encontrado', async () => {
      const id = 'user-inexistente';

      repository.findById.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      await expect(service.findById(id)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve propagar erro do repository', async () => {
      const id = 'user-123';

      repository.findById.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(service.findById(id)).rejects.toThrow('Erro de banco de dados');
    });
  });

  describe('update', () => {
    it('deve atualizar usuário existente sem alterar senha', async () => {
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
        senha: '$2b$10$oldHashedPassword',
        trash: 0,
      };

      repository.update.mockResolvedValue(mockUsuarioUpdated);

      const result = await service.update(id, updateData);

      expect(repository.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(mockUsuarioUpdated);
    });

    it('deve atualizar usuário com nova senha hasheada', async () => {
      const id = 'user-123';
      const updateData = {
        nome: 'JOÃO DA SILVA SANTOS',
        setor: 'GERÊNCIA',
        senha: 'novaSenha456',
      };

      const senhaHash = '$2b$10$newHashedPassword';
      const mockUsuarioUpdated = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA SANTOS',
        codigo: 'JS001',
        setor: 'GERÊNCIA',
        senha: senhaHash,
        trash: 0,
      };

      bcryptMock.hash.mockResolvedValue(senhaHash as never);
      repository.update.mockResolvedValue(mockUsuarioUpdated);

      const result = await service.update(id, updateData);

      expect(bcryptMock.hash).toHaveBeenCalledWith('novaSenha456', 10);
      expect(repository.update).toHaveBeenCalledWith(id, {
        nome: 'JOÃO DA SILVA SANTOS',
        setor: 'GERÊNCIA',
        senha: senhaHash,
      });
      expect(result).toEqual(mockUsuarioUpdated);
    });

    it('deve propagar NotFoundException do repository', async () => {
      const id = 'user-inexistente';
      const updateData = { nome: 'NOME NOVO' };

      repository.update.mockRejectedValue(new NotFoundException('Usuário não encontrado'));

      await expect(service.update(id, updateData)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete do usuário', async () => {
      const id = 'user-123';
      const mockUsuarioRemoved = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: '$2b$10$hashedPassword',
        trash: 1,
      };

      repository.softDelete.mockResolvedValue(mockUsuarioRemoved);

      const result = await service.remove(id);

      expect(repository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Usuário removido com sucesso!' });
    });

    it('deve propagar NotFoundException do repository', async () => {
      const id = 'user-inexistente';

      repository.softDelete.mockRejectedValue(new NotFoundException('Usuário não encontrado'));

      await expect(service.remove(id)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve propagar erro do repository', async () => {
      const id = 'user-123';

      repository.softDelete.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(service.remove(id)).rejects.toThrow('Erro de banco de dados');
    });
  });
});