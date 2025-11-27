import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Declarations')
@Controller('declarations')
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() createDeclarationDto: CreateDeclarationDto) {
    return this.declarationsService.create(createDeclarationDto);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto, @Query('userId') userId?: string) {
    return this.declarationsService.findAll(paginationDto, userId);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.declarationsService.findOne(id);
  }

  @Put(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDeclarationDto: UpdateDeclarationDto) {
    return this.declarationsService.update(id, updateDeclarationDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.declarationsService.remove(id);
  }
}
