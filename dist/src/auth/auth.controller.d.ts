import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
