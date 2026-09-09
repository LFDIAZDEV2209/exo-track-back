import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ConceptSubtypesService } from './concept-subtypes.service';
import { CreateConceptSubtypeDto } from './dto/create-concept-subtype.dto';
import { UpdateConceptSubtypeDto } from './dto/update-concept-subtype.dto';
import { FindAllConceptSubtypesDto } from './dto/find-all-concept-subtypes.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ConceptSubtypes')
@Controller('concept-subtypes')
export class ConceptSubtypesController {
  constructor(private readonly conceptSubtypesService: ConceptSubtypesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() createDto: CreateConceptSubtypeDto) {
    return this.conceptSubtypesService.create(createDto);
  }

  @Get()
  @Auth()
  findAll(@Query() findAllDto: FindAllConceptSubtypesDto) {
    return this.conceptSubtypesService.findAll(findAllDto);
  }

  @Put(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateConceptSubtypeDto) {
    return this.conceptSubtypesService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.conceptSubtypesService.remove(id);
  }
}
