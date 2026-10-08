import { PaginationResult } from '../../common/types/types';
import { Issue } from '../entities/issue.entity';

export type IssueListResponse = {
  data: Issue[];
  pagination: PaginationResult;
};
