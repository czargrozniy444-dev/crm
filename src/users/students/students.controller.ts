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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentGroupDto } from './dto/pdate-student-group.dto';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  @Patch(':userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateGroup(
    @Param('userId') userId: string,
    @Body() dto: UpdateStudentGroupDto,
  ) {
    return this.service.updateGroup(userId, dto.groupId ?? undefined);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  list() {
    return this.service.list();
  }
  @Patch(':userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('userId') userId: string, @Body() dto: UpdateStudentDto) {
    return this.service.update(userId, dto);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('userId') userId: string) {
    return this.service.remove(userId);
  }
}
