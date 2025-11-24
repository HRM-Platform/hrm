import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/guards/public.decorator';

@ApiTags('Test')
@Controller()
export class AppController {
  @Public()
  @Get('hello')
  getHello() {
    return {
      message: 'Hello from HRM Backend!',
      timestamp: new Date().toISOString(),
    };
  }
}
