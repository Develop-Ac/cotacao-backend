import { PrismaService } from '../prisma/prisma.service';
export interface CreateUsuarioInput {
    nome: string;
    email: string;
    senha: string;
}
export declare class UsuarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        usuario_id: number;
        nome: string;
        email: string;
    }[]>;
    create(data: CreateUsuarioInput): Promise<{
        message: string;
        data: {
            usuario_id: number;
            nome: string;
            email: string;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
