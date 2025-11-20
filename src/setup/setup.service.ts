import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { DepartmentsService } from 'src/departments/departments.service';
import { ShiftsService } from 'src/shifts/shifts.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/user.entity';
import { CompleteSetupDto } from './dto/complete-setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly companiesService: CompaniesService,
    private readonly departmentsService: DepartmentsService,
    private readonly shiftsService: ShiftsService,
    private readonly authService: AuthService,
  ) {}

  async completeSetup(dto: CompleteSetupDto) {
    // Step 1: Create Company
    const company = await this.companiesService.create(dto.company_name);

    // Step 2: Create Department
    const department = await this.departmentsService.create({
      name: dto.department_name,
      company_id: company.id,
    });

    // Step 3: Create Shift
    const shift = await this.shiftsService.createShift({
      name: dto.shift_name,
      company_id: company.id,
      department_id: department.id,
      start_time: dto.shift_start_time,
      end_time: dto.shift_end_time,
      grace_period: dto.grace_period || 15,
    });

    // Step 4: Create User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userResponse = await this.authService.registerUser({
      email: dto.user_email,
      password: dto.user_password,
      first_name: dto.user_first_name,
      last_name: dto.user_last_name,
    });

    // Step 5: Assign User to Department
    const user = await this.userRepo.findOne({
      where: { email: dto.user_email },
    });

    if (user) {
      user.department = department;
      if (dto.user_role) {
        user.role = dto.user_role;
      }
      await this.userRepo.save(user);
    }

    // Return complete setup information
    return {
      message: 'Complete setup successful',
      data: {
        company: {
          id: company.id,
          name: company.name,
        },
        department: {
          id: department.id,
          name: department.name,
        },
        shift: {
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          grace_period: shift.grace_period,
        },
        user: {
          id: user?.id,
          email: dto.user_email,
          first_name: dto.user_first_name,
          last_name: dto.user_last_name,
          role: user?.role,
          department_id: department.id,
        },
      },
    };
  }
}
