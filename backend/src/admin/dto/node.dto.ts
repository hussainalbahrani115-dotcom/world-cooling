import { PartialType } from '@nestjs/mapped-types';
import { NodeType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateNodeDto {
  @IsEnum(NodeType)
  nodeType: NodeType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  questionText?: string;

  @IsOptional()
  @IsUUID()
  subsystemId?: string;

  @IsOptional()
  @IsUUID()
  parentNodeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceWeight?: number;
}

export class UpdateNodeDto extends PartialType(CreateNodeDto) {}
