import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MarketplaceCategory {
  id: string;
  slug: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  hide_from_explore: boolean;
}

export function useMarketplaceCategories() {
  return useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,slug,label,icon,sort_order,is_active,hide_from_explore")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MarketplaceCategory[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
