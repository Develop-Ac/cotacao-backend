import { PrismaService } from '../prisma/prisma.service';
export declare class LoginService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    login(email: string, senha: string): Promise<{
        success: boolean;
        message: string;
        usuario: {
            usuario_id: number;
            nome: string;
            email: string;
            trash: number;
        };
    }>;
}
