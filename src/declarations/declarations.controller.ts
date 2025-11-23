import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('declarations')
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  @Post()
  create(@Body() createDeclarationDto: CreateDeclarationDto) {
    return this.declarationsService.create(createDeclarationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query('userId') userId?: string) {
    return this.declarationsService.findAll(paginationDto, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.declarationsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDeclarationDto: UpdateDeclarationDto) {
    return this.declarationsService.update(id, updateDeclarationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.declarationsService.remove(id);
  }
}
