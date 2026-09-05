import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('appliances')
  listAppliances() {
    return this.catalogService.listAppliances();
  }

  @Get('appliances/:id/symptoms')
  listSymptoms(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.listSymptoms(id);
  }
}
