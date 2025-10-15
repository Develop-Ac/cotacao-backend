import { LoginService } from './login.service';
declare class LoginDto {
    email: string;
    senha: string;
}
export declare class LoginController {
    private readonly loginService;
    constructor(loginService: LoginService);
    login(dto: LoginDto): Promise<{
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
export {};
