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
import { identity, retry } from 'rxjs';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

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

  async updateUser(id: number, data: Partial<UpdateUserDto>) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new NotFoundException(`user with ${id} not found`);
    }

    Object.assign(user, data);

    return await this.usersRepo.save(user);
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
        user: instanceToPlain(user),
        access_token: accessToken,
      },
    };
  }

  async findOneBy(id) {
    return await this.usersRepo.findOneBy({ id });
  }

  async getProfile(userId: number) {
    const user = await this.findOneBy(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: instanceToPlain(user),
    };
  }

  async listUsers() {
    return await this.usersRepo.find();
  }
}
