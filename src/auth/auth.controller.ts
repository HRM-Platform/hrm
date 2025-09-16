import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register_dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/guards/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async registerUser(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Public()
  @Post('/login')
  async loginUser(@Body() { email, password }: LoginDto) {
    return await this.authService.loginUser(email, password);
  }
}
