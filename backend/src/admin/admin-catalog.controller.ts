import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import { AdminCatalogService } from './admin-catalog.service';
import { CreateApplianceDto, UpdateApplianceDto } from './dto/appliance.dto';
import { CreateSubsystemDto, UpdateSubsystemDto } from './dto/subsystem.dto';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';
import { CreatePartDto, UpdatePartDto } from './dto/part.dto';

@UseGuards(AdminApiKeyGuard)
@Controller('admin')
export class AdminCatalogController {
  constructor(private readonly service: AdminCatalogService) {}

  @Get('appliances')
  listAppliances() {
    return this.service.listAppliances();
  }

  @Get('appliances/:id')
  getAppliance(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getAppliance(id);
  }

  @Post('appliances')
  createAppliance(@Body() dto: CreateApplianceDto) {
    return this.service.createAppliance(dto);
  }

  @Patch('appliances/:id')
  updateAppliance(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateApplianceDto) {
    return this.service.updateAppliance(id, dto);
  }

  @Delete('appliances/:id')
  removeAppliance(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeAppliance(id);
  }

  @Get('appliances/:id/subsystems')
  listSubsystems(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.listSubsystems(id);
  }

  @Post('appliances/:id/subsystems')
  createSubsystem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateSubsystemDto) {
    return this.service.createSubsystem(id, dto);
  }

  @Patch('subsystems/:id')
  updateSubsystem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSubsystemDto) {
    return this.service.updateSubsystem(id, dto);
  }

  @Delete('subsystems/:id')
  removeSubsystem(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeSubsystem(id);
  }

  @Get('appliances/:id/symptoms')
  listSymptoms(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.listSymptoms(id);
  }

  @Post('appliances/:id/symptoms')
  createSymptom(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateSymptomDto) {
    return this.service.createSymptom(id, dto);
  }

  @Patch('symptoms/:id')
  updateSymptom(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSymptomDto) {
    return this.service.updateSymptom(id, dto);
  }

  @Delete('symptoms/:id')
  removeSymptom(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeSymptom(id);
  }

  @Get('parts')
  listParts() {
    return this.service.listParts();
  }

  @Post('parts')
  createPart(@Body() dto: CreatePartDto) {
    return this.service.createPart(dto);
  }

  @Patch('parts/:id')
  updatePart(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartDto) {
    return this.service.updatePart(id, dto);
  }

  @Delete('parts/:id')
  removePart(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removePart(id);
  }
}
