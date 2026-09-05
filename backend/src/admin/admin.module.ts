import { Module } from '@nestjs/common';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminTreeController } from './admin-tree.controller';
import { AdminTreeService } from './admin-tree.service';
import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';

@Module({
  controllers: [AdminCatalogController, AdminTreeController, AdminReportsController],
  providers: [AdminCatalogService, AdminTreeService, AdminReportsService],
})
export class AdminModule {}
