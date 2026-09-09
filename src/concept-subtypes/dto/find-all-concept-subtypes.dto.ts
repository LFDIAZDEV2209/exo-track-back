import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ItemScope } from 'src/shared/enums/item-scope.enum';

export class FindAllConceptSubtypesDto {

    @IsOptional()
    @IsEnum(ItemScope)
    scope?: ItemScope;

    @IsOptional()
    @IsUUID()
    conceptTypeId?: string;

    @IsOptional()
    @Transform(({ value }: { value: unknown }): unknown => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;
}
