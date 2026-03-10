import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  venmo_link: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  sms_consent: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  images: string[];
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_farmstand: boolean;
  stock_count: number | null;
  is_preorder: boolean;
  egg_count: number | null;
  promo_code: string | null;
  promo_discount_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface SellerWithListings extends Profile {
  listings: Listing[];
  categoryName?: string;
  distance?: number;
}

function getDistanceMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useSellers(userLocation?: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ["sellers", userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      const { data: allListings, error: listingsError } = await supabase
        .from("listings")
        .select("*");

      if (listingsError) throw listingsError;
      const typedListings = (allListings ?? []) as Listing[];
      if (!typedListings.length) return [];

      // Group listings by seller_id
      const listingsBySeller = new Map<string, Listing[]>();
      typedListings.forEach((l) => {
        const existing = listingsBySeller.get(l.seller_id) ?? [];
        existing.push(l);
        listingsBySeller.set(l.seller_id, existing);
      });

      // Try to fetch profiles for enrichment (name, bio, avatar, venmo)
      let profileMap = new Map<string, Profile>();
      try {
        const { data: profiles } = await supabase.from("profiles").select("*");
        if (profiles?.length) {
          // Figure out which column matches seller_id by checking overlap
          const sellerIds = new Set(listingsBySeller.keys());
          for (const p of profiles as any[]) {
            // Try common column names
            const matchId = p.user_id || p.id;
            if (sellerIds.has(matchId)) {
              profileMap.set(matchId, p as Profile);
            }
          }
        }
      } catch {
        // Profiles unavailable, continue with listing-only data
      }

      const results: SellerWithListings[] = [];

      for (const [sellerId, sellerListings] of listingsBySeller) {
        const profile = profileMap.get(sellerId);
        const primaryCategory = sellerListings[0]?.category;
        const firstListingWithImage = sellerListings.find((l) => l.images?.length);

        let distance: number | undefined;
        if (userLocation) {
          const listingWithCoords = sellerListings.find((l) => l.latitude && l.longitude);
          const lat = listingWithCoords?.latitude ?? profile?.latitude;
          const lon = listingWithCoords?.longitude ?? profile?.longitude;
          if (lat && lon) {
            distance = getDistanceMiles(userLocation.lat, userLocation.lng, lat, lon);
          }
        }

        results.push({
          id: sellerId,
          name: profile?.name || sellerListings[0]?.location?.split(",")[0] || "Local Seller",
          email: profile?.email ?? null,
          phone: profile?.phone ?? null,
          bio: profile?.bio ?? null,
          avatar_url: profile?.avatar_url ?? firstListingWithImage?.images?.[0] ?? null,
          venmo_link: profile?.venmo_link ?? null,
          address: profile?.address ?? sellerListings[0]?.location ?? null,
          latitude: profile?.latitude ?? null,
          longitude: profile?.longitude ?? null,
          sms_consent: profile?.sms_consent ?? null,
          created_at: profile?.created_at ?? sellerListings[0]?.created_at,
          updated_at: profile?.updated_at ?? sellerListings[0]?.updated_at,
          listings: sellerListings,
          categoryName: primaryCategory,
          distance,
        });
      }

      // Sort by distance if location available
      if (userLocation) {
        results.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
      }

      return results;
    },
  });
}

export function useSellerById(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["seller", sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("sellers_public")
        .select("*")
        .eq("id", sellerId!)
        .single();

      if (error) throw error;
      const typedProfile = profile as Profile;

      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", sellerId!);

      const typedListings = (listings ?? []) as Listing[];

      return {
        ...typedProfile,
        listings: typedListings,
        categoryName: typedListings[0]?.category,
      } as SellerWithListings;
    },
  });
}

export interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  hide_from_explore: boolean;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) throw error;
      return ((data ?? []) as Category[])
        .filter((c) => c.is_active && !c.hide_from_explore)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}
