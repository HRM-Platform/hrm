import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Req,
  UseGuards,
  Res,
  Logger,
  Patch,
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
import { UserProfile } from './interfaces/user-profile.interface';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import { Exists } from 'src/common/decorators/exists.decorator';
import { CheckEmailDto } from './dto/check-email.dto';

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
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(id, dto);
  }

  @Public()
  @Post('/login')
  async loginUser(@Body() { email, password }: LoginDto) {
    return await this.authService.loginUser(email, password);
  }

  @Public()
  @Post('/check-email')
  async checkEmail(@Body() { email }: CheckEmailDto) {
    return await this.authService.checkEmail(email);
  }

  @Get('/profile')
  async getProfile(@CurrentUser('userId') userId: string) {
    return await this.authService.getProfile(userId);
  }

  @Get('/my-email')
  getMyEmail(@CurrentUser('email') email: string | undefined) {
    return { email };
  }

  @Get('/list-users')
  async listUsers() {
    return this.authService.listUsers();
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Patch('/assign-department')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async AssignDepartment(@Body() dto: AssignDepartmentDto) {
    return this.authService.assignDepartment(dto);
  }

  // Redirect to Google for login
  @Public()
  @Get('google-login')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    Logger.log('Redirecting to Google for authentication');
  }

  // Callback from Google OAuth
  @Public()
  @Get('google-login/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: AuthRequest, @Res() res: Response) {
    Logger.log('Google login callback hit');
    const user = req.user;

    // return req.user; //! test JSON response

    if (!user) return res.status(400).send('No user returned from Google');
    // Map User entity to UserProfile
    const userProfile: UserProfile = {
      userId: user.id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: 'user',
    };

    Logger.log(`Authenticated user: ${JSON.stringify(userProfile)}`);

    // Generate JWT
    const token = this.authService.generateJwt(userProfile);

    Logger.log(`Generated JWT: ${token}`);

    // Redirect frontend with token
    res.redirect(`http://localhost:3000/welcome?token=${token}`);
  }

  @Get('welcome')
  welcome(@Req() req: Request, @Res() res: Response) {
    const email = req.query.email as string;
    res.send(`<h1>Welcome, ${email}</h1>`);
  }
}
