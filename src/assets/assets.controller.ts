import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseUUIDPipe } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll(@Query() findAllDto: FindAllByDeclarationDto) {
    return this.assetsService.findAll(findAllDto, findAllDto.declarationId);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.assetsService.findOne(term);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.remove(id);
  }
}
