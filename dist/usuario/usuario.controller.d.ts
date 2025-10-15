import { UsuarioService } from './usuario.service';
declare class CreateUsuarioDto {
    nome: string;
    email: string;
    senha: string;
}
export declare class UsuarioController {
    private readonly usuarioService;
    constructor(usuarioService: UsuarioService);
    index(): Promise<{
        usuario_id: number;
        nome: string;
        email: string;
    }[]>;
    store(dto: CreateUsuarioDto): Promise<{
        message: string;
        data: {
            usuario_id: number;
            nome: string;
            email: string;
        };
    }>;
    destroy(id: string): Promise<{
        message: string;
    }>;
}
export {};
