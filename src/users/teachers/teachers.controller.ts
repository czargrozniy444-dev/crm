import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private service: TeachersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateTeacherDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  list() {
    return this.service.list();
  }
  @Patch(':userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('userId') userId: string, @Body() dto: UpdateTeacherDto) {
    return this.service.update(userId, dto);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  remove(@Param('userId') userId: string) {
    return this.service.remove(userId);
  }
}
