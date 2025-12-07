import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { FindAllDeclarationsDto } from './dto/find-all-declarations.dto';

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
  findAll(@Query() findAllDto: FindAllDeclarationsDto) {
    return this.declarationsService.findAll(findAllDto);
  }

  // ✅ Rutas específicas ANTES de la ruta dinámica :id
  @Get('stats')
  @Auth(UserRole.ADMIN)
  getStats() {
    return this.declarationsService.getStats();
  }

  @Get('recent-activity')
  @Auth(UserRole.ADMIN)
  getRecentActivity(@Query('limit') limit?: number) {
    const limitValue = limit ? parseInt(limit.toString()) : 5;
    return this.declarationsService.getRecentActivity(limitValue);
  }

  @Get('taxable-years')
  @Auth()
  getTaxableYearsByUser(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.declarationsService.getTaxableYearsByUser(userId);
  }

  // ✅ Ruta dinámica :id al final
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
