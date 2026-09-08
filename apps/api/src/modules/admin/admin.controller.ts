import { Controller, Get, Post, Query, Header } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  public async getHealth() {
    return this.adminService.getHealth();
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  public async getMetrics(): Promise<string> {
    return this.adminService.getMetrics();
  }

  @Post('seed')
  public async seedDatabase(@Query('tenantId') tenantId: string = 'default-tenant') {
    return this.adminService.seedDatabase(tenantId);
  }
}
