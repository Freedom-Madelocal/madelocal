import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type MarketplaceListingRow = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  seller_id: string;
  description: string | null;
  stock_count: number | null;
  listing_type_id: string | null;
  egg_count?: number | null;
  is_unclaimed?: boolean;
  is_farmstand?: boolean;
  listing_types?: { name: string; inventory_type: "infinite" | "limited" } | null;
  public_profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    shop_name: string | null;
    shop_avatar_url: string | null;
    delivery_price: number | null;
    delivery_min_qty: number | null;
    delivery_max_radius: number | null;
    is_unclaimed: boolean | null;
    contact_url: string | null;
    contact_phone: string | null;
    marketplace_enabled: boolean | null;
  } | null;
};

const SELECT =
  "id,title,price,category,location,city,state,latitude,longitude,images,seller_id,description,stock_count,listing_type_id,egg_count,is_unclaimed,is_farmstand,listing_types(name,inventory_type)";

const PROFILE_COLS =
  "id,full_name,avatar_url,shop_name,shop_avatar_url,delivery_price,delivery_min_qty,delivery_max_radius,is_unclaimed,contact_url,contact_phone,marketplace_enabled";

async function attachProfiles<T extends { seller_id: string; public_profiles?: any }>(
  rows: T[]
): Promise<T[]> {
  if (!rows.length) return rows;
  const sellerIds = Array.from(new Set(rows.map((r) => r.seller_id).filter(Boolean)));
  if (!sellerIds.length) return rows;
  const { data: profiles } = await supabase
    .from("public_profiles")
    .select(PROFILE_COLS)
    .in("id", sellerIds);
  const map = new Map<string, any>();
  for (const p of (profiles ?? []) as any[]) map.set(p.id, p);
  return rows.map((r) => ({ ...r, public_profiles: map.get(r.seller_id) ?? null }));
}

export function useMarketplaceListings() {
  return useQuery({
    queryKey: ["marketplace", "listings", "active"],
    queryFn: async (): Promise<MarketplaceListingRow[]> => {
      const { data, error } = await supabase
        .from("listings")
        .select(SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as MarketplaceListingRow[];
      return await attachProfiles(rows);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useMarketplaceListing(id?: string) {
  return useQuery({
    queryKey: ["marketplace", "listing", id],
    enabled: !!id,
    queryFn: async (): Promise<MarketplaceListingRow | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("listings")
        .select(SELECT + ",is_active")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data || (data as any).is_active !== true) return null;
      const [row] = await attachProfiles([data as unknown as MarketplaceListingRow]);
      return row;
    },
  });
}
