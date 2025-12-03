import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { FindAllByDeclarationDto } from 'src/shared/dtos/find-all-by-declaration.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Incomes')
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(createIncomeDto);
  }

  @Get()
  @Auth()
  findAll(@Query() findAllDto: FindAllByDeclarationDto) {
    return this.incomesService.findAll(findAllDto, findAllDto.declarationId);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.incomesService.findOne(term);
  }

  @Put(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomesService.update(id, updateIncomeDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.incomesService.remove(id);
  }
}
