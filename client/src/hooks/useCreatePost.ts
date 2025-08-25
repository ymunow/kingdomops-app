import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ✅ Bulletproof key with cursor handling
const FEED_KEY = (scope: "church" | "group", visibility: "members" | "public") =>
  ["feed", scope, visibility, { cursor: null }] as const;

// ✅ Handle any server response shape  
function extractPost(saved: any) {
  return saved?.item ?? saved?.data ?? saved?.post ?? saved;
}

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
  const key = FEED_KEY(scope, visibility);

  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      // ✅ Use apiRequest which handles auth correctly
      const res = await apiRequest('POST', '/api/feed/posts', {
        ...payload, 
        scope, 
        visibility 
      });
      
      // ✅ Extract from any server response shape
      return extractPost(res);
    },
    onMutate: async (newPost) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any[]>(key) ?? [];

      const optimistic = {
        id: `optimistic-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isPinned: false,
        isAnnouncement: newPost.type === "announcement",
        isMine: true,
        userId: currentUser?.id || "me",
        author: {
          id: currentUser?.id || "me",
          displayName: currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || "You",
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
          profileImageUrl: currentUser?.profileImageUrl
        },
        scope,
        visibility,
        likesCount: 0,
        prayersCount: 0,
        commentsCount: 0,
        attachments: [],
        ...newPost,
      };

      // ✅ PREPEND so it shows even if the list is paged
      qc.setQueryData<any[]>(key, [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _newPost, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // rollback
    },
    onSuccess: (serverItem) => {
      const item = serverItem && serverItem.id ? serverItem : null;

      qc.setQueryData<any[]>(key, (old = []) => {
        // remove optimistic(s)
        const rest = old.filter(p => !String(p.id).startsWith("optimistic-"));
        // if server didn't return the item, keep old; list will refresh below
        return item ? [item, ...rest] : rest;
      });

      // ✅ Ensure we're looking at the FIRST PAGE (no cursor) after posting
      qc.invalidateQueries({ queryKey: key });
    },
  });
}