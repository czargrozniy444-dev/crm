import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const exists = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (exists) throw new ConflictException('Phone already used');

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      if (dto.groupId) {
        const g = await tx.group.findUnique({
          where: { id: dto.groupId, isActive: true },
        });
        if (!g) throw new NotFoundException('Group not found or inactive');
      }

      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          passwordHash,
          role: Role.STUDENT,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          groupId: dto.groupId ?? null,
        },
      });

      return user;
    });
  }

  async updateGroup(userId: string, groupId: string | null | undefined) {
    if (groupId === undefined) {
      throw new BadRequestException(
        'Provide "groupId" (string) or null to detach',
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({
        where: { id: userId, role: Role.STUDENT, isActive: true },
        select: { id: true },
      });
      if (!user) throw new NotFoundException('Student not found or inactive');

      await tx.studentProfile.upsert({
        where: { userId: userId },
        update: {},
        create: { userId: userId },
      });

      if (groupId === null) {
        const updated = await tx.studentProfile.update({
          where: { userId },
          data: { groupId: null },
          select: { userId: true, groupId: true },
        });
        return { message: 'Detached from group', ...updated };
      }

      const group = await tx.group.findUnique({
        where: { id: groupId, isActive: true },
        select: { id: true },
      });
      if (!group) throw new NotFoundException('Group not found or inactive');

      const updated = await tx.studentProfile.update({
        where: { userId },
        data: { groupId },
        select: {
          userId: true,
          groupId: true,
          group: { select: { name: true } },
        },
      });

      return { message: 'Assigned to group', ...updated };
    });
  }

  list() {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async update(userId: string, dto: UpdateStudentDto) {
    if (dto.phone) {
      const exists = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (exists && exists.id !== userId)
        throw new ConflictException('Phone already used');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: userId, role: Role.STUDENT },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const dataUser: any = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      };
      if (dto.password) dataUser.passwordHash = await argon2.hash(dto.password);

      await tx.user.update({ where: { id: userId }, data: dataUser });

      let groupIdUpdate: string | null | undefined = undefined;
      if (dto.groupId !== undefined) {
        if (dto.groupId === null) groupIdUpdate = null;
        else {
          const g = await tx.group.findUnique({
            where: { id: dto.groupId, isActive: true },
          });
          if (!g) throw new NotFoundException('Group not found or inactive');
          groupIdUpdate = dto.groupId;
        }
      }

      await tx.studentProfile.update({
        where: { userId },
        data: {
          dateOfBirth:
            dto.dateOfBirth === undefined
              ? undefined
              : dto.dateOfBirth
                ? new Date(dto.dateOfBirth)
                : null,
          startDate:
            dto.startDate === undefined
              ? undefined
              : dto.startDate
                ? new Date(dto.startDate)
                : null,
          groupId: groupIdUpdate,
        },
      });

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      });
    });
  }

  async remove(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId, role: Role.STUDENT },
    });
    if (!u) throw new NotFoundException('Student not found');
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return { success: true };
  }
}
