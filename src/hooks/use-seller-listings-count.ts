import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

/**
 * Returns the total number of listings (active + inactive) the current
 * seller has ever created. Used to gate the Seller Dashboard behind a
 * "create your first listing" empty state.
 */
export function useSellerListingsCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["seller", "listings-count", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60 * 1000,
  });
}
