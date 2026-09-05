import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @MinLength(1)
  answerText: string;

  @IsOptional()
  @IsUUID()
  nextNodeId?: string;
}

export class UpdateAnswerDto extends PartialType(CreateAnswerDto) {}
