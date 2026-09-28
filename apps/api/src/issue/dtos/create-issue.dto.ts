import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { IssueType } from '../enums/Issue-type.enum';
import { IssuePriority } from '../enums/Issue-priority.enum';

export class CreateIssueDto {
  @IsString()
  @Length(2, 255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(IssueType)
  issueType: IssueType;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  parentIssueId?: string;
}
