// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Department } from 'src/departments/department.entity';
import { RegisterDto } from './dto/register-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { GoogleUser } from './interfaces/google-user.interface';
import { UserProfile } from './interfaces/user-profile.interface';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashedPassword });

    await this.usersRepo.save(user);
    return instanceToPlain(user);
  }

  async updateUser(id: string, data: Partial<UpdateUserDto>) {
    const user = await this.findOneBy(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    Object.assign(user, data);
    await this.usersRepo.save(user);
    return instanceToPlain(user);
  }

  async loginUser(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) throw new BadRequestException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { ...instanceToPlain(user), access_token: accessToken };
  }

  async findOneBy(id: string) {
    return await this.usersRepo.findOne({
      where: { id },
      relations: ['department'],
    });
  }

  async getProfile(userId: string) {
    const user = await this.findOneBy(userId);
    if (!user) throw new NotFoundException('User not found');

    return { user: instanceToPlain(user) };
  }

  async listUsers() {
    const users = await this.usersRepo.find({ relations: ['department'] });
    return users.map((u) => instanceToPlain(u));
  }

  async deleteUser(id: string) {
    const user = await this.findOneBy(id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepo.remove(user);
    return {
      message: 'User deleted successfully',
      data: { user: instanceToPlain(user) },
    };
  }

  generateJwt(user: UserProfile) {
    return this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }

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
    return instanceToPlain(user) as any;
  }

  async assignDepartment(dto: AssignDepartmentDto) {
    const user = await this.usersRepo.findOne({
      where: { id: dto.user_id },
      relations: ['department'],
    });
    if (!user) throw new NotFoundException('User not found');

    const department = await this.deptRepo.findOne({
      where: { id: dto.department_id },
    });
    if (!department) throw new NotFoundException('Department not found');

    if (user.department?.id === department.id) {
      throw new BadRequestException('User is already in this department');
    }

    user.department = department;
    user.status = true;
    return instanceToPlain(await this.usersRepo.save(user));
  }
}
