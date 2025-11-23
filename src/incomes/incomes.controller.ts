import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(createIncomeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.incomesService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.incomesService.findOne(term);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomesService.update(id, updateIncomeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.incomesService.remove(id);
  }
}
