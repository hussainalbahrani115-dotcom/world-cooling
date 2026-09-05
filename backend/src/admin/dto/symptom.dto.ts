import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSymptomDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  subsystemId?: string;
}

export class UpdateSymptomDto extends PartialType(CreateSymptomDto) {}
