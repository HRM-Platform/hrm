// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Register new user
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new UnauthorizedException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await this.usersRepository.save(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result;
  }

  // Validate login
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  // Generate JWT token
  login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, email: user.email };
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  // Get user profile
  async getProfile(user: Omit<User, 'password'>) {
    return user;
  }
}
