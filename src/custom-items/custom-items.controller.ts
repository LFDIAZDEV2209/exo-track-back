import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { CustomItemsService } from './custom-items.service';
import { CreateCustomItemDto } from './dto/create-custom-item.dto';
import { UpdateCustomItemDto } from './dto/update-custom-item.dto';
import { FindAllCustomItemsDto } from './dto/find-all-custom-items.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CustomItems')
@Controller('custom-items')
export class CustomItemsController {
  constructor(private readonly customItemsService: CustomItemsService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() createCustomItemDto: CreateCustomItemDto) {
    return this.customItemsService.create(createCustomItemDto);
  }

  @Get()
  @Auth()
  findAll(@Query() findAllDto: FindAllCustomItemsDto) {
    return this.customItemsService.findAll(findAllDto, findAllDto.declarationId);
  }

  @Put(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomItemDto: UpdateCustomItemDto) {
    return this.customItemsService.update(id, updateCustomItemDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customItemsService.remove(id);
  }
}
