import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    profileImageUrl?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    name?: string;
  };
  name?: string; // For cases where user object isn't available
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  user,
  name,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const displayName = user?.displayName || user?.name || name;
  const firstLetter = displayName?.charAt(0) || 
    user?.firstName?.charAt(0) || 
    'U';
  
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {user?.profileImageUrl && (
        <AvatarImage 
          src={user.profileImageUrl} 
          alt={`${displayName}'s profile picture`} 
          className="object-cover" 
        />
      )}
      <AvatarFallback 
        className={cn(
          "bg-spiritual-blue/10 text-spiritual-blue font-semibold", 
          fallbackClassName
        )}
      >
        {firstLetter.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
