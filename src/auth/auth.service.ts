// src/auth/auth.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register-dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user-dto';
import { GoogleUser } from './interfaces/google-user.interface';

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

  async findOneBy(id: number) {
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

  async deleteUser(id: number) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepo.remove(user);
    return {
      message: 'User deleted successfully',
      data: {
        user: instanceToPlain(user),
      },
    };
  }

  // Login or register via Google
  async loginOrRegisterGoogle(googleUser: GoogleUser): Promise<User> {
    let user = await this.usersRepo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = this.usersRepo.create({
        email: googleUser.email,
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
      });
      await this.usersRepo.save(user);
    }

    return user;
  }

  login(user: User) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }
}
