type MemberAvatarProps = {
  name: string;
  profileImage?: string | null;
};

function MemberAvatar({ name, profileImage }: MemberAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
      {initials || 'U'}
    </div>
  );
}

export default MemberAvatar;
