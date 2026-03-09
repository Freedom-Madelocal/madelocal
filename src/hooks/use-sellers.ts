import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Profile {
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  email: string | null;
  id: string;
  latitude: number | null;
  longitude: number | null;
  name: string;
  phone: string | null;
  role: "buyer" | "seller" | "both";
  sms_consent: boolean | null;
  updated_at: string;
  user_id: string;
  venmo_link: string | null;
}

export interface Listing {
  category_id: string;
  created_at: string;
  description: string | null;
  id: string;
  image_url: string | null;
  is_active: boolean | null;
  price: number | null;
  seller_id: string;
  title: string;
  updated_at: string;
}

export interface Category {
  created_at: string;
  icon: string | null;
  id: string;
  name: string;
}

export interface SellerWithListings extends Profile {
  listings: Listing[];
  categoryName?: string;
}

export function useSellers() {
  return useQuery({
    queryKey: ["sellers"],
    queryFn: async () => {
      // Get listings first to find active sellers
      const { data: allListings, error: listingsError } = await supabase
        .from("listings")
        .select("*");

      if (listingsError) throw listingsError;
      const typedListings = (allListings ?? []) as Listing[];
      if (!typedListings.length) return [];

      const sellerIds = [...new Set(typedListings.map((l) => l.seller_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", sellerIds);

      if (profilesError) throw profilesError;
      const typedProfiles = (profiles ?? []) as Profile[];
      if (!typedProfiles.length) return [];

      const { data: categories } = await supabase.from("categories").select("*");
      const typedCategories = (categories ?? []) as Category[];

      const categoryMap = new Map(typedCategories.map((c) => [c.id, c]));
      const listingsBySeller = new Map<string, Listing[]>();

      typedListings.forEach((l) => {
        const existing = listingsBySeller.get(l.seller_id) ?? [];
        existing.push(l);
        listingsBySeller.set(l.seller_id, existing);
      });

      return typedProfiles.map((profile): SellerWithListings => {
        const sellerListings = listingsBySeller.get(profile.user_id) ?? [];
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
      const typedProfile = profile as Profile;

      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId!);

      const typedListings = (listings ?? []) as Listing[];

      const { data: categories } = await supabase.from("categories").select("*");
      const typedCategories = (categories ?? []) as Category[];
      const categoryMap = new Map(typedCategories.map((c) => [c.id, c]));

      return {
        ...typedProfile,
        listings: typedListings,
        categoryName: categoryMap.get(typedListings[0]?.category_id ?? "")?.name,
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
        .select("*");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}
