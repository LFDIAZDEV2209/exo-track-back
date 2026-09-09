import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Put } from '@nestjs/common';
import { ConceptTypesService } from './concept-types.service';
import { CreateConceptTypeDto } from './dto/create-concept-type.dto';
import { UpdateConceptTypeDto } from './dto/update-concept-type.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ConceptTypes')
@Controller('concept-types')
export class ConceptTypesController {
  constructor(private readonly conceptTypesService: ConceptTypesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() createConceptTypeDto: CreateConceptTypeDto) {
    return this.conceptTypesService.create(createConceptTypeDto);
  }

  @Get()
  @Auth()
  findAll() {
    return this.conceptTypesService.findAll();
  }

  @Put(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateConceptTypeDto: UpdateConceptTypeDto) {
    return this.conceptTypesService.update(id, updateConceptTypeDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.conceptTypesService.remove(id);
  }
}
