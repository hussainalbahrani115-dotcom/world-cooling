import { PartialType } from '@nestjs/mapped-types';
import { IsString, MinLength } from 'class-validator';

export class CreateSubsystemDto {
  @IsString()
  @MinLength(1)
  nameAr: string;

  @IsString()
  @MinLength(1)
  nameEn: string;
}

export class UpdateSubsystemDto extends PartialType(CreateSubsystemDto) {}
