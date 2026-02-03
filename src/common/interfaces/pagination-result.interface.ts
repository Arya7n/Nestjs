import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
    @ApiProperty({ example: 1 })
    currentPage: number;

    @ApiProperty({ example: 10 })
    itemsPerPage: number;

    @ApiProperty({ example: 100 })
    totalItems: number;

    @ApiProperty({ example: 10 })
    totalPages: number;

    @ApiProperty({ example: true })
    hasNextPage: boolean;

    @ApiProperty({ example: false })
    hasPreviousPage: boolean;
}

export class PaginationResult<T> {
    @ApiProperty({ isArray: true })
    data: T[];

    @ApiProperty({ type: PaginationMeta })
    meta: PaginationMeta;
}
