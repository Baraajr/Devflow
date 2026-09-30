import type { ReactNode } from 'react';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';

import {
  useCreateComment,
  useDeleteComment,
  useIssueComments,
  useUpdateComment,
} from '../../hooks/useComments';

import { Button } from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { useModal } from '../../ui/ModalContext';

import CommentForm from './CommentForm';

interface CommentsProps {
  projectId: string;
  issueId: string;
  currentUserId: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string | null;
  };
}

function Avatar({
  firstName,
  lastName,
  profileImage,
}: {
  firstName: string;
  lastName?: string;
  profileImage?: string | null;
}) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={firstName}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/50 text-xs font-semibold text-white">
      {firstName.charAt(0).toUpperCase()}
      {lastName?.charAt(0).toUpperCase()}
    </div>
  );
}

function Comments({ projectId, issueId, currentUserId }: CommentsProps) {
  const { close } = useModal();

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useIssueComments(projectId, issueId);

  const createComment = useCreateComment(projectId, issueId);

  const handleCreate = async (data: { content: string }) => {
    await createComment.mutateAsync(data);
    close();
  };

  return (
    <Card
      title="Comments"
      icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
      action={
        <Modal.Open opens="create-comment">
          <Button type="button" size="sm">
            Add comment
          </Button>
        </Modal.Open>
      }
    >
      {isLoading ? (
        <div className="space-y-5">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load comments.</p>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />

          <p className="mt-3 text-sm font-medium text-primary">
            No comments yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Start the discussion on this issue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              issueId={issueId}
              currentUserId={currentUserId}
              close={close}
            />
          ))}
        </div>
      )}

      <Modal.Window name="create-comment">
        <CommentForm
          submitLabel="Add Comment"
          isLoading={createComment.isPending}
          onSubmit={handleCreate}
        />
      </Modal.Window>
    </Card>
  );
}

function CommentItem({
  comment,
  projectId,
  issueId,
  currentUserId,
  close,
}: {
  comment: Comment;
  projectId: string;
  issueId: string;
  currentUserId: string;
  close: () => void;
}) {
  const updateComment = useUpdateComment(projectId, issueId, comment.id);

  const deleteComment = useDeleteComment(projectId, issueId);

  const isAuthor = comment.authorId === currentUserId;

  const wasEdited =
    new Date(comment.updatedAt).getTime() >
    new Date(comment.createdAt).getTime() + 1000;

  const handleUpdate = async (data: { content: string }) => {
    await updateComment.mutateAsync(data);
    close();
  };

  const handleDelete = async () => {
    await deleteComment.mutateAsync(comment.id);
    close();
  };

  return (
    <article className="group">
      <div className="flex gap-3">
        <Avatar
          firstName={comment.author.firstName}
          lastName={comment.author.lastName}
          profileImage={comment.author.profileImage}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-primary">
                {comment.author.firstName} {comment.author.lastName}
              </p>

              <span className="text-xs text-muted-foreground">
                {formatCommentDate(comment.createdAt)}
              </span>

              {wasEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {isAuthor && (
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <Modal.Open opens={`edit-comment-${comment.id}`}>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                    title="Edit comment"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </Modal.Open>

                <Modal.Open opens={`delete-comment-${comment.id}`}>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                    title="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Modal.Open>
              </div>
            )}
          </div>

          <div className="mt-2 rounded-xl bg-background px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {comment.content}
            </p>
          </div>
        </div>
      </div>

      <Modal.Window name={`edit-comment-${comment.id}`}>
        <CommentForm
          initialContent={comment.content}
          submitLabel="Update Comment"
          isLoading={updateComment.isPending}
          onSubmit={handleUpdate}
          onCancel={close}
        />
      </Modal.Window>

      <Modal.Window name={`delete-comment-${comment.id}`}>
        <ConfirmDialog
          resourceName="comment"
          description="This comment will be permanently deleted."
          onConfirm={handleDelete}
          disabled={deleteComment.isPending}
        />
      </Modal.Window>
    </article>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-background" />

      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-background" />
        <div className="h-16 animate-pulse rounded-xl bg-background" />
      </div>
    </div>
  );
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
        </div>

        {action}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

export default Comments;
