import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    description:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(1)
  password: string;
}
