import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';

@Controller('liabilities')
export class LiabilitiesController {
  constructor(private readonly liabilitiesService: LiabilitiesService) {}

  @Post()
  create(@Body() createLiabilityDto: CreateLiabilityDto) {
    return this.liabilitiesService.create(createLiabilityDto);
  }

  @Get()
  findAll() {
    return this.liabilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liabilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiabilityDto: UpdateLiabilityDto) {
    return this.liabilitiesService.update(+id, updateLiabilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liabilitiesService.remove(+id);
  }
}
