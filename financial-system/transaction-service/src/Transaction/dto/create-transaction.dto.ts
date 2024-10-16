import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'f7b3b3b0-3b7b-4b7b-8b7b-7b7b7b7b7b7b', type: 'string' })
  accountExternalIdDebit: string;

  @ApiProperty({ example: 'f7b3b3b0-3b7b-4b7b-8b7b-7b7b7b7b7b7b', type: 'string' })
  accountExternalIdCredit: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  tranferTypeId: number;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @IsPositive()
  value: number;
}