type MemberRoleBadgeProps = {
  role: string;
};

function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
  return (
    <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
      {role}
    </span>
  );
}

export default MemberRoleBadge;
