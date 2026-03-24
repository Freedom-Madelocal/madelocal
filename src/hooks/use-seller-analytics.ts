import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export interface SellerAnalytics {
  profile_views: { total_30d: number; prev_30d: number; change_pct: number };
  search_appearances: { total_30d: number; prev_30d: number; change_pct: number };
  contact_clicks: { total_30d: number; prev_30d: number; change_pct: number };
  followers: { total: number; engaged_30d: number };
}

export function useSellerAnalytics() {
  const { user } = useAuth();

  return useQuery<SellerAnalytics>({
    queryKey: ["seller-analytics", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-seller-analytics");
      if (error) throw error;
      return data as SellerAnalytics;
    },
  });
}
