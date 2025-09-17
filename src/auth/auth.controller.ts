import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { Public } from 'src/common/guards/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user-dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user: User;
}
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async registerUser(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Put('update/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.authService.updateUser(id, dto);
  }

  @Public()
  @Post('/login')
  async loginUser(@Body() { email, password }: LoginDto) {
    return await this.authService.loginUser(email, password);
  }

  @Get('/profile')
  async getProfile(@CurrentUser('sub') userId: number) {
    return await this.authService.getProfile(userId);
  }

  @Get('/list-users')
  async listUsers() {
    return this.authService.listUsers();
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteUser(id);
  }

  // Redirect to Google for login
  @Public()
  @Get('google-login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  // Callback from Google OAuth
  @Public()
  @Get('google-login/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: AuthRequest, @Res() res: Response) {
    const user = req.user;
    // Redirect to frontend with token
    res.redirect(`/auth/welcome?email=${encodeURIComponent(user.email)}`);
  }

  @Get('welcome')
  welcome(@Req() req: Request, @Res() res: Response) {
    const email = req.query.email as string;
    res.send(`<h1>Welcome, ${email}</h1>`);
  }
}
