import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrgDto {
  @ApiProperty({
    example: 'DevFlow',
    description: 'Organization name.',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Engineering project management platform.',
    description: 'Optional organization description.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
