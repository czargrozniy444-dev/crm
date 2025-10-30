import { IsOptional, IsString, ValidateIf } from 'class-validator';

/**
 * groupId:
 *  - string  -> biriktirish
 *  - null    -> guruhdan chiqarish
 */
export class UpdateStudentGroupDto {
  @ValidateIf((o) => o.groupId !== null && o.groupId !== undefined)
  @IsString()
  @IsOptional()
  groupId?: string | null;
}
