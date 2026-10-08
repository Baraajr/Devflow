import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { IssueType } from '../enums/Issue-type.enum';
import { IssueStatus } from '../enums/Issue-status.enum';
import { IssuePriority } from '../enums/Issue-priority.enum';

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  @Length(2, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(IssueType)
  issueType?: IssueType;

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsUUID()
  parentIssueId?: string | null;

  @IsOptional()
  @IsUUID()
  sprintId?: string;
}
