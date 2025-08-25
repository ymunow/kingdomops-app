import { useQuery } from "@tanstack/react-query";
import { feedKey } from "./feedKeys";
import { apiRequest } from "@/lib/queryClient";

export function useFeed(scope: "church" | "group" = "church", visibility: "members" | "public" = "members") {
  return useQuery({
    queryKey: feedKey(scope, visibility),
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/feed?scope=${scope}&visibility=${visibility}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items ?? []);
        return items as any[]; // already sorted by server (pinned → announcement → newest)
      } catch (error) {
        console.error('Feed fetch error:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 10_000,
  });
}

// This file now only handles feed fetching
// Post creation has been moved to useCreatePost.ts