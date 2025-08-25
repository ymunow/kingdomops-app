import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedKey } from "./feedKeys";
import { apiRequest } from "@/lib/queryClient";

type CreatePayload = {
  type: "testimony" | "prayer" | "photo" | "announcement";
  body: string;
  title?: string;
  visibility?: "members" | "public";
  scope?: "church" | "group";
  groupId?: string;
  photoUrl?: string;
};

export function useCreatePost(scope: "church" | "group" = "church", visibility: "members" | "public" = "members", currentUser?: any) {
  const qc = useQueryClient();
  const key = feedKey(scope, visibility);

  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const res = await apiRequest('POST', '/api/feed/posts', {
        scope,
        visibility,
        ...payload,
      });
      const saved = await res.json();
      // Ensure server responds in spec shape; if not, wrap
      return (saved?.id ? saved : { ...saved, id: saved?.id ?? crypto.randomUUID() });
    },
    onMutate: async (newPost) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any[]>(key) || [];
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isAnnouncement: newPost.type === "announcement",
        isPinned: false,
        authorId: currentUser?.id || "me",
        author: {
          id: currentUser?.id || "me",
          displayName: currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || "You",
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
          profileImageUrl: currentUser?.profileImageUrl
        },
        isMine: true,
        isOptimistic: true,
        likesCount: 0,
        prayersCount: 0,
        commentsCount: 0,
        attachments: [],
        ...newPost,
      };
      qc.setQueryData<any[]>(key, [optimistic, ...prev]); // appears instantly at top
      return { prev };
    },
    onError: (_err, _newPost, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // rollback
    },
    onSuccess: (saved) => {
      qc.setQueryData<any[]>(key, (old = []) => {
        // Remove optimistic, insert saved at top
        const rest = old.filter(p => !String(p.id).startsWith("optimistic-"));
        return [saved, ...rest];
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key }); // pull canonical list from server
    },
  });
}