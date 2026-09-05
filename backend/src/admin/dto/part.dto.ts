import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsObject, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  storeUrl: string;

  @IsString()
  @MinLength(1)
  stockStatus: string;

  @IsOptional()
  @IsObject()
  compatibleModels?: Record<string, unknown>;
}

export class UpdatePartDto extends PartialType(CreatePartDto) {}
