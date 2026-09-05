import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import { AdminReportsService } from './admin-reports.service';

@UseGuards(AdminApiKeyGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly service: AdminReportsService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('by-appliance')
  byAppliance() {
    return this.service.byAppliance();
  }
}
