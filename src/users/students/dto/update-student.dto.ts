import {
  IsDateString,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateStudentDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsPhoneNumber('UZ') phone?: string;
  @IsOptional() @IsString() password?: string;

  @IsOptional() @IsDateString() dateOfBirth?: string | null;
  @IsOptional() @IsDateString() startDate?: string | null;
  @IsOptional() groupId?: string | null;
}
