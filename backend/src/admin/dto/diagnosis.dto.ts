import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';

export class DiagnosisPartLinkDto {
  @IsUUID()
  partId: string;

  @IsBoolean()
  isRequired: boolean;
}

export class CreateDiagnosisDto {
  @IsString()
  @MinLength(1)
  diagnosisTitle: string;

  @IsString()
  @MinLength(1)
  rootCause: string;

  @IsString()
  @MinLength(1)
  severityLevel: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisPartLinkDto)
  parts: DiagnosisPartLinkDto[];
}

export class UpdateDiagnosisDto extends PartialType(OmitType(CreateDiagnosisDto, ['parts'] as const)) {}

export class ReplaceDiagnosisPartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisPartLinkDto)
  parts: DiagnosisPartLinkDto[];
}
