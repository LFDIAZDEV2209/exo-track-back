import { Controller, Get, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { UnclassifiedItemsService } from './unclassified-items.service';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('UnclassifiedItems')
@Controller('unclassified-items')
export class UnclassifiedItemsController {
  constructor(private readonly unclassifiedItemsService: UnclassifiedItemsService) {}

  @Get()
  @Auth()
  findAll(@Query() findAllDto: FindAllByDeclarationDto) {
    return this.unclassifiedItemsService.findAll(findAllDto, findAllDto.declarationId);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.unclassifiedItemsService.remove(id);
  }
}
