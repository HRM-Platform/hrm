// src/auth/auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register_dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new NotFoundException('Email already exist');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashedPassword });
    await this.usersRepo.save(user);
    return user;
  }

  // Generate JWT token
  async loginUser(email: string, password: string) {
    const user = await this.usersRepo.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      throw new NotFoundException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: 'altafkorejo',
    });

    return {
      message: 'Login successful',
      data: {
        ...user,
        acces_token: accessToken,
      },
    };
  }
}
