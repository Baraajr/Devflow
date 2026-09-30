export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
