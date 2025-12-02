import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class FindAllDeclarationsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
