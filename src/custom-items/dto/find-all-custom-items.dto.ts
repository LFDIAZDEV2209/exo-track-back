import { IsOptional, IsUUID } from 'class-validator';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';

export class FindAllCustomItemsDto extends FindAllByDeclarationDto {

    @IsOptional()
    @IsUUID()
    conceptTypeId?: string;
}
