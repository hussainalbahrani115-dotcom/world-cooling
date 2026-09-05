import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import { AdminTreeService } from './admin-tree.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';
import { CreateAnswerDto, UpdateAnswerDto } from './dto/answer.dto';
import { CreateDiagnosisDto, UpdateDiagnosisDto, ReplaceDiagnosisPartsDto } from './dto/diagnosis.dto';

@UseGuards(AdminApiKeyGuard)
@Controller('admin')
export class AdminTreeController {
  constructor(private readonly service: AdminTreeService) {}

  @Get('appliances/:id/tree')
  getTree(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTree(id);
  }

  @Post('appliances/:id/nodes')
  createNode(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateNodeDto) {
    return this.service.createNode(id, dto);
  }

  @Patch('nodes/:id')
  updateNode(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNodeDto) {
    return this.service.updateNode(id, dto);
  }

  @Delete('nodes/:id')
  removeNode(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeNode(id);
  }

  @Post('nodes/:id/answers')
  createAnswer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateAnswerDto) {
    return this.service.createAnswer(id, dto);
  }

  @Patch('answers/:id')
  updateAnswer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAnswerDto) {
    return this.service.updateAnswer(id, dto);
  }

  @Delete('answers/:id')
  removeAnswer(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeAnswer(id);
  }

  @Post('nodes/:id/diagnosis')
  createDiagnosis(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateDiagnosisDto) {
    return this.service.createDiagnosis(id, dto);
  }

  @Patch('diagnoses/:id')
  updateDiagnosis(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDiagnosisDto) {
    return this.service.updateDiagnosis(id, dto);
  }

  @Put('diagnoses/:id/parts')
  replaceDiagnosisParts(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReplaceDiagnosisPartsDto) {
    return this.service.replaceDiagnosisParts(id, dto);
  }

  @Delete('diagnoses/:id')
  removeDiagnosis(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeDiagnosis(id);
  }
}
