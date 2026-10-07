import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../domain/value-objects/user-role';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    maxLength: 72,
    description: 'Plain password. Only its bcrypt hash is stored.',
  })
  @IsString()
  @MinLength(8)
  // bcrypt only uses the first 72 bytes of the password.
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.HOME_USER,
    example: UserRole.HOME_USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
