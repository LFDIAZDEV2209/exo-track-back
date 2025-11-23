import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseUUIDPipe } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('liabilities')
export class LiabilitiesController {
  constructor(private readonly liabilitiesService: LiabilitiesService) {}

  @Post()
  create(@Body() createLiabilityDto: CreateLiabilityDto) {
    return this.liabilitiesService.create(createLiabilityDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.liabilitiesService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.liabilitiesService.findOne(term);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateLiabilityDto: UpdateLiabilityDto) {
    return this.liabilitiesService.update(id, updateLiabilityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.liabilitiesService.remove(id);
  }
}
