import { Body, Controller, Post } from '@nestjs/common';
import { SetupService } from './setup.service';
import { CompleteSetupDto } from './dto/complete-setup.dto';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post('complete')
  completeSetup(@Body() dto: CompleteSetupDto) {
    return this.setupService.completeSetup(dto);
  }
}
