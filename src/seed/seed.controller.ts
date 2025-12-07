import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(UserRole.ADMIN)
  executeSeed() {
    return this.seedService.runSeed();
  }

  @Delete()
  @Auth(UserRole.ADMIN)
  cleanDatabase() {
    return this.seedService.cleanDatabase();
  }
}
