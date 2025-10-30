import {
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsPhoneNumber('UZ') phone?: string;

  @IsOptional() @IsString() password?: string;

  @IsOptional() @IsUrl() photoUrl?: string;

  @ValidateIf((o) => o.percentShare == null)
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlySalary?: number;

  @ValidateIf((o) => o.monthlySalary == null)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentShare?: number;
}
