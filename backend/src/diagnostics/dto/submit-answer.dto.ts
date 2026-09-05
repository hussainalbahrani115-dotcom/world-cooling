import { IsUUID } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  nodeAnswerId: string;
}
