import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { LoginRepository } from './login.repository';
import * as bcrypt from 'bcryptjs';

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('LoginService', () => {
  let service: LoginService;
  let repository: jest.Mocked<LoginRepository>;
  let bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  const mockLoginRepository = {
    findUsuarioByCodigo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: LoginRepository,
          useValue: mockLoginRepository,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    repository = module.get<LoginRepository>(LoginRepository) as jest.Mocked<LoginRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar sucesso quando credenciais válidas', async () => {
      const codigo = 'JS001';
      const senha = 'senha123';
      const senhaHash = '$2b$10$hashedPassword';

      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: senhaHash,
        trash: 0,
      };

      const expectedResponse = {
        success: true,
        message: 'Login realizado com sucesso',
        usuario: 'JOÃO DA SILVA',
        usuario_id: 'user-123',
        codigo: 'JS001',
      };

      repository.findUsuarioByCodigo.mockResolvedValue(mockUsuario);
      bcryptMock.compare.mockResolvedValue(true as never);

      const result = await service.login(codigo, senha);

      expect(repository.findUsuarioByCodigo).toHaveBeenCalledWith(codigo);
      expect(bcryptMock.compare).toHaveBeenCalledWith(senha, senhaHash);
      expect(result).toEqual(expectedResponse);
    });

    it('deve retornar erro quando usuário não existe', async () => {
      const codigo = 'USER_INEXISTENTE';
      const senha = 'senha123';

      repository.findUsuarioByCodigo.mockResolvedValue(null);

      const result = await service.login(codigo, senha);

      expect(repository.findUsuarioByCodigo).toHaveBeenCalledWith(codigo);
      expect(bcryptMock.compare).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'Usuario não existe.',
      });
    });

    it('deve retornar erro quando senha incorreta', async () => {
      const codigo = 'JS001';
      const senha = 'senhaErrada';
      const senhaHash = '$2b$10$hashedPassword';

      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: senhaHash,
        trash: 0,
      };

      repository.findUsuarioByCodigo.mockResolvedValue(mockUsuario);
      bcryptMock.compare.mockResolvedValue(false as never);

      const result = await service.login(codigo, senha);

      expect(repository.findUsuarioByCodigo).toHaveBeenCalledWith(codigo);
      expect(bcryptMock.compare).toHaveBeenCalledWith(senha, senhaHash);
      expect(result).toEqual({
        success: false,
        message: 'Senha incorreta.',
      });
    });

    it('deve retornar usuário sem senha no campo data', async () => {
      const codigo = 'MS002';
      const senha = 'senha456';
      const senhaHash = '$2b$10$anotherHashedPassword';

      const mockUsuario = {
        id: 'user-456',
        nome: 'MARIA SANTOS',
        codigo: 'MS002',
        setor: 'VENDAS',
        senha: senhaHash,
        trash: 0,
      };

      repository.findUsuarioByCodigo.mockResolvedValue(mockUsuario);
      bcryptMock.compare.mockResolvedValue(true as never);

      const result = await service.login(codigo, senha);

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('usuario', 'MARIA SANTOS');
      expect(result).toHaveProperty('usuario_id', 'user-456');
      expect(result).toHaveProperty('codigo', 'MS002');
      expect(result).not.toHaveProperty('senha');
    });

    it('deve lidar com erro de bcrypt', async () => {
      const codigo = 'JS001';
      const senha = 'senha123';
      const senhaHash = '$2b$10$hashedPassword';

      const mockUsuario = {
        id: 'user-123',
        nome: 'JOÃO DA SILVA',
        codigo: 'JS001',
        setor: 'ESTOQUE',
        senha: senhaHash,
        trash: 0,
      };

      repository.findUsuarioByCodigo.mockResolvedValue(mockUsuario);
      bcryptMock.compare.mockRejectedValue(new Error('Erro no bcrypt') as never);

      await expect(service.login(codigo, senha)).rejects.toThrow('Erro no bcrypt');
    });

    it('deve lidar com erro do repository', async () => {
      const codigo = 'JS001';
      const senha = 'senha123';

      repository.findUsuarioByCodigo.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(service.login(codigo, senha)).rejects.toThrow('Erro de banco de dados');
    });
  });
});