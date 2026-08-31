import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(passwordConfirm: string, args: ValidationArguments): boolean {
    const object = args.object as { password: string };

    return passwordConfirm === object.password;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address.',
  })
  @IsEmail()
  @IsString()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u, {
    message: 'First name contains invalid characters',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u, {
    message: 'Last name contains invalid characters',
  })
  lastName: string;

  @ApiProperty({
    example: 'StrongPass123',
    description:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Must match the password field.',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Validate(PasswordMatchConstraint)
  passwordConfirm: string;
}
