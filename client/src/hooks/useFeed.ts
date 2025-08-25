import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useFeed(scope: "church" | "group" = "church", visibility = "members") {
  return useQuery({
    queryKey: ["feed", scope, visibility],
    queryFn: async () => {
      try {
        // Use apiRequest to handle authentication properly
        const response = await apiRequest('GET', '/api/feed');
        const data = await response.json();
        
        // Ensure we always return an array
        const items = Array.isArray(data) ? data : (data.items ?? []);
        return sortFeed(items);
      } catch (error) {
        console.error('Feed fetch error:', error);
        return []; // Return empty array on error
      }
    },
  });
}

function sortFeed(items: any[]) {
  // Order: pinned → announcements → newest first
  return [...items].sort((a, b) => {
    // Pinned posts first
    const pin = Number(!!b.isPinned) - Number(!!a.isPinned);
    if (pin !== 0) return pin;
    
    // Then announcements
    const ann = Number(!!b.isAnnouncement) - Number(!!a.isAnnouncement);
    if (ann !== 0) return ann;
    
    // Then newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function useCreatePost(scope: "church" | "group" = "church", currentUser?: any) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      type: "testimony" | "prayer" | "photo" | "announcement";
      body: string;
      title?: string;
      visibility?: "members" | "public";
      scope?: string;
    }) => {
      const response = await apiRequest('POST', '/api/feed/posts', {
        scope,
        visibility: "members",
        ...payload,
      });
      const data = await response.json(); // ✅ Parse JSON, don't return raw Response
      return data; // return the canonical post from API
    },
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed", scope, "members"] });
      
      const queryKey = ["feed", scope, "members"];
      const previousFeed = queryClient.getQueryData<any[]>(queryKey) || [];

      // ✅ Feed Config Spec: Create optimistic post with isMine flag  
      const optimisticPost = {
        id: `optimistic-${Date.now()}`,
        authorId: currentUser?.id,
        author: {
          displayName: currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'You',
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
        },
        createdAt: new Date().toISOString(),
        isPinned: false,
        isAnnouncement: newPost.type === "announcement",
        reactionCounts: {},
        commentCount: 0,
        isOptimistic: true, // flag for styling
        isMine: true, // ✅ Spec compliance: Mark as user's own post
        ...newPost, // includes body, title, type, etc.
      };

      // Add optimistic post to top of feed
      queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
        sortFeed([optimisticPost, ...(old || [])])
      );

      return { previousFeed, queryKey };
    },
    onError: (_err, _newPost, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousFeed);
      }
    },
    onSuccess: (savedPost, _newPost, context) => {
      if (!context) return;
      
      // Replace optimistic with real post
      queryClient.setQueryData(context.queryKey, (old: any[] | undefined) => {
        const filtered = (old || []).filter((p) => !String(p.id).startsWith("optimistic-"));
        return sortFeed([savedPost, ...filtered]);
      });
    },
    onSettled: (_data, _error, _variables, context) => {
      // Ensure perfect sync
      if (context) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}