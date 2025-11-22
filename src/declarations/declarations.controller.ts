import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';

@Controller('declarations')
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  @Post()
  create(@Body() createDeclarationDto: CreateDeclarationDto) {
    return this.declarationsService.create(createDeclarationDto);
  }

  @Get()
  findAll() {
    return this.declarationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declarationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclarationDto: UpdateDeclarationDto) {
    return this.declarationsService.update(+id, updateDeclarationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declarationsService.remove(+id);
  }
}
