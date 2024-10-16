import { ApiProperty } from "@nestjs/swagger";

export class TransactionDto {
    @ApiProperty({ example: 1, type: 'number' })
    id: number;

    @ApiProperty({ example: '3862d559-e98d-46f8-9f35-e5d7a6ed99bf', type: 'string' })
    externalId: string;

    @ApiProperty({ example: 'f7b3b3b0-3b7b-4b7b-8b7b-7b7b7b7b7b7b', type: 'string' })
    accountExternalIdDebit: string;

    @ApiProperty({ example: 'f7b3b3b0-3b7b-4b7b-8b7b-7b7b7b7b7b7b', type: 'string' })
    accountExternalIdCredit: string;

    @ApiProperty({ example: 1, type: 'number' })
    tranferTypeId: number;

    @ApiProperty({ example: 999.99, type: 'number' })
    value: number;

    @ApiProperty({ example: 'approved', type: 'string' })
    status: string;

    @ApiProperty({ example: '2021-10-05T20:00:00.000Z', type: 'date' })
    createdAt: Date;
}
