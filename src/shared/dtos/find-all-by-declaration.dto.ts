import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllByDeclarationDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by declaration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  declarationId?: string;
}
