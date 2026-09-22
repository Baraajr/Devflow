import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
