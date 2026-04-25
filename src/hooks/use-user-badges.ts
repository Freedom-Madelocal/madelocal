import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type UserBadge = {
  id: string;
  user_id: string;
  text: string;
  color: string;
  color_end: string | null;
  tooltip: string | null;
  sort_order: number;
};

const SELECT = "id,user_id,text,color,color_end,tooltip,sort_order";

/**
 * Fetch all badges assigned to a single user, sorted by sort_order ASC.
 * Mirrors badges granted on the marketplace web app (source: public.user_badges).
 */
export function useUserBadges(userId?: string | null) {
  return useQuery({
    queryKey: ["user-badges", userId],
    enabled: !!userId,
    queryFn: async (): Promise<UserBadge[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select(SELECT)
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as UserBadge[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Batch-fetch badges for many users in a single request, returning a
 * Map<user_id, UserBadge[]>. Use on feeds (discover, following) to avoid N+1.
 */
export function useUserBadgesBatch(userIds: string[]) {
  // Stable key — sorted, deduped
  const ids = Array.from(new Set(userIds.filter(Boolean))).sort();
  return useQuery({
    queryKey: ["user-badges-batch", ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<Map<string, UserBadge[]>> => {
      const { data, error } = await supabase
        .from("user_badges")
        .select(SELECT)
        .in("user_id", ids)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const map = new Map<string, UserBadge[]>();
      for (const b of (data ?? []) as unknown as UserBadge[]) {
        const arr = map.get(b.user_id) ?? [];
        arr.push(b);
        map.set(b.user_id, arr);
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}
