import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;
export type Listing = Tables<"listings">;
export type Category = Tables<"categories">;

export interface SellerWithListings extends Profile {
  listings: Listing[];
  categoryName?: string;
}

export function useSellers() {
  return useQuery({
    queryKey: ["sellers"],
    queryFn: async () => {
      // Fetch profiles that are sellers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["seller", "both"]);

      if (profilesError) throw profilesError;
      if (!profiles?.length) return [];

      const sellerIds = profiles.map((p) => p.user_id);

      // Fetch their listings
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .in("seller_id", sellerIds);

      if (listingsError) throw listingsError;

      // Fetch categories for category names
      const { data: categories } = await supabase
        .from("categories")
        .select("*");

      const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);
      const listingsBySeller = new Map<string, Listing[]>();
      
      (listings ?? []).forEach((l) => {
        const existing = listingsBySeller.get(l.seller_id) ?? [];
        existing.push(l);
        listingsBySeller.set(l.seller_id, existing);
      });

      return profiles.map((profile): SellerWithListings => {
        const sellerListings = listingsBySeller.get(profile.user_id) ?? [];
        // Get primary category from first listing
        const primaryCatId = sellerListings[0]?.category_id;
        const primaryCat = primaryCatId ? categoryMap.get(primaryCatId) : undefined;

        return {
          ...profile,
          listings: sellerListings,
          categoryName: primaryCat?.name,
        };
      });
    },
  });
}

export function useSellerById(userId: string | undefined) {
  return useQuery({
    queryKey: ["seller", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();

      if (error) throw error;

      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId!);

      const { data: categories } = await supabase
        .from("categories")
        .select("*");

      const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);

      return {
        ...profile,
        listings: listings ?? [],
        categoryName: categoryMap.get(listings?.[0]?.category_id ?? "")?.name,
      } as SellerWithListings;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
