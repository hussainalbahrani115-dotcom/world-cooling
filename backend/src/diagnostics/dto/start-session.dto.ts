import { IsOptional, IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  applianceId: string;

  // اختياري: العرض الأولي الذي اختاره المستخدم من قائمة الأعراض الشائعة (Phase 2).
  // غير مستخدَم بعد لاختيار نقطة بداية مختلفة في الشجرة — راجع ملاحظة في DiagnosticsService.startSession.
  @IsOptional()
  @IsUUID()
  symptomId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
