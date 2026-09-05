import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Post('sessions')
  startSession(@Body() dto: StartSessionDto) {
    return this.diagnosticsService.startSession(dto);
  }

  @Get('sessions/:id')
  getSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosticsService.getSession(id);
  }

  @Post('sessions/:id/answer')
  submitAnswer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SubmitAnswerDto) {
    return this.diagnosticsService.submitAnswer(id, dto);
  }

  // ⚠️ مؤقت لأغراض الاختبار — يُستبدل في Phase 4 بمعالج Webhook لبوابة الدفع الحقيقية.
  @Post('sessions/:id/simulate-payment')
  simulatePayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosticsService.simulatePayment(id);
  }
}
