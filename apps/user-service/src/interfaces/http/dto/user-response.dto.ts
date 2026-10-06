import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/value-objects/user-role';

/** Public view of a user. Never includes the password hash. */
export class UserResponseDto {
  @ApiProperty({ example: '3f1c2a4e-8d4b-4c4f-9f7e-2b1a6c9d0e11' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.HOME_USER })
  role: UserRole;

  @ApiProperty({ example: '2026-10-06T10:00:00.000Z' })
  createdAt: string;

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email.value,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
