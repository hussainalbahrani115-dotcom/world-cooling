import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateApplianceDto {
  @IsString()
  @MinLength(1)
  nameAr: string;

  @IsString()
  @MinLength(1)
  nameEn: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateApplianceDto extends PartialType(CreateApplianceDto) {}
