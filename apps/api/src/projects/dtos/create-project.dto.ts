import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  key: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
