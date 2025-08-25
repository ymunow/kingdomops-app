import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bell, Image, Calendar } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

type PostType = "testimony" | "prayer" | "photo" | "announcement";
type Visibility = "members" | "public";
type Scope = "church" | "group";

const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "ORG_OWNER", 
  "ORG_ADMIN",
  "ORG_LEADER",
  "ADMIN",
]);

interface FeedComposerProps {
  currentUser: { id: string; role?: string | null; displayName?: string; firstName?: string; lastName?: string; profileImageUrl?: string };
  defaultScope?: Scope;
  onPosted?: () => void;
}

export function FeedComposer({
  currentUser,
  defaultScope = "church",
  onPosted,
}: FeedComposerProps) {
  const { toast } = useToast();
  
  // ✅ Always initialize controlled inputs to empty strings
  const [body, setBody] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  // ✅ Map visible tab labels to API enums (testimony vs post)
  const [postType, setPostType] = React.useState<PostType>("testimony");
  const [visibility, setVisibility] = React.useState<Visibility>("members");
  const [scope, setScope] = React.useState<Scope>(defaultScope);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isAdmin = ADMIN_ROLES.has((currentUser?.role || "").toUpperCase());

  // 🔒 Hide Announcements if not admin (both UI & logic)
  const allowedTypes: Array<{ 
    label: string; 
    value: PostType; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string;
  }> = [
    { label: "Post", value: "testimony" as PostType, icon: Send, color: "bg-green-500" },
    { label: "Prayer Request", value: "prayer" as PostType, icon: Bell, color: "bg-purple-500" },
    { label: "Photo", value: "photo" as PostType, icon: Image, color: "bg-blue-500" },
    ...(isAdmin ? [{ label: "Announcement", value: "announcement" as PostType, icon: Calendar, color: "bg-orange-500" }] : []),
  ];

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!body.trim()) return;
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/feed/posts', {
        // ✅ API expects these exact enums:
        type: postType, // "testimony" | "prayer" | "photo" | "announcement"
        body: body.trim(),
        title: title.trim() || undefined,
        visibility, // "members" | "public"
        scope, // "church" | "group"
      });

      // Reset
      setBody("");
      setTitle("");
      setPostType("testimony");
      
      toast({
        title: "Success!",
        description: `Your ${postType === 'testimony' ? 'post' : postType === 'prayer' ? 'prayer request' : postType === 'photo' ? 'photo' : 'announcement'} has been shared with the community.`,
      });
      
      onPosted?.();
    } catch (err) {
      console.error('Post creation error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      // ⛔️ Kill accidental click‑eaters: ensure this container does NOT block clicks
      style={{ position: "relative" }}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm"
    >
      {/* Post Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allowedTypes.map(({ value, label, icon: Icon, color }) => (
          <Button
            key={value}
            type="button"
            variant={postType === value ? "default" : "outline"}
            size="sm"
            onClick={() => setPostType(value)}
            className={`${postType === value ? color : ''} flex items-center gap-2`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Title (optional, shown for announcement & testimony) */}
      {(postType === "announcement" || postType === "testimony") && (
        <Input
          type="text"
          placeholder={postType === "announcement" ? "Announcement title" : "Title (optional)"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3"
          disabled={isSubmitting}
        />
      )}

      {/* Main Input Area with Profile Avatar */}
      <div className="flex gap-3 mb-4">
        <UserAvatar 
          user={currentUser} 
          className="h-10 w-10 flex-shrink-0" 
        />
        <Textarea
          placeholder="What's on your heart?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={(e) => {
            console.log("Textarea focused:", e.target.value);
          }}
          rows={4}
          className="flex-1 border-0 bg-gray-50 dark:bg-gray-700 resize-none focus:ring-2 focus:ring-spiritual-blue focus:border-transparent cursor-text"
          style={{
            position: 'relative',
            zIndex: 10, // make sure it's above decorative siblings
            pointerEvents: "auto", // force clickability
          }}
          onMouseDown={(e) => {
            // fight through weird wrappers: ensure focus is applied
            const t = e.currentTarget as HTMLTextAreaElement;
            if (document.activeElement !== t) t.focus();
          }}
          disabled={isSubmitting}
          data-testid="post-textarea"
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* Visibility / Scope Controls */}
        <div className="flex items-center gap-3">
          <Select value={visibility} onValueChange={(value: Visibility) => setVisibility(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="members">Members</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scope} onValueChange={(value: Scope) => setScope(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="church">Whole Church</SelectItem>
              <SelectItem value="group">This Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Share Button */}
        <Button 
          type="submit"
          disabled={!body.trim() || isSubmitting}
          className="bg-spiritual-blue hover:bg-spiritual-blue/90"
        >
          {isSubmitting ? "Sharing..." : "Share"}
        </Button>
      </div>
    </form>
  );
}