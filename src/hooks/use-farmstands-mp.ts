import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FarmstandRow {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  claimed: boolean;
  claimed_at: string | null;
  admin_user_id: string | null;
  food_types: string[] | null;
  schedule: unknown;
  is_stocked: boolean | null;
  menu_image_url: string | null;
  created_via: string | null;
  // legacy compatibility for any consumer still reading `claimed_by`
  claimed_by: string | null;
}

interface FarmstandPageDbRow {
  id: string;
  slug: string | null;
  name: string;
  description?: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  menu_image_url: string | null;
  food_types: string[] | null;
  schedule: unknown;
  is_stocked: boolean | null;
  claimed_at: string | null;
  admin_user_id: string | null;
  created_via: string | null;
}

export function useFarmstandsMP() {
  return useQuery({
    queryKey: ["farmstands-mp", "farmstand_pages"],
    queryFn: async (): Promise<FarmstandRow[]> => {
      const { data, error } = await supabase
        .from("farmstand_pages")
        .select(
          "id,slug,name,description,city,state,latitude,longitude,logo_url,menu_image_url,food_types,schedule,is_stocked,claimed_at,admin_user_id,created_via"
        )
        .eq("is_active", true);
      if (error) throw error;
      const rows = (data ?? []) as unknown as FarmstandPageDbRow[];
      return rows
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r): FarmstandRow => {
          const location = [r.city, r.state].filter(Boolean).join(", ") || null;
          return {
            id: r.id,
            slug: r.slug,
            name: r.name,
            description: r.description ?? null,
            image_url: r.logo_url,
            location,
            latitude: r.latitude as number,
            longitude: r.longitude as number,
            claimed: r.claimed_at != null,
            claimed_at: r.claimed_at,
            admin_user_id: r.admin_user_id,
            claimed_by: r.admin_user_id,
            food_types: r.food_types ?? null,
            schedule: r.schedule ?? null,
            is_stocked: r.is_stocked,
            menu_image_url: r.menu_image_url,
            created_via: r.created_via,
          };
        });
    },
    staleTime: 5 * 60 * 1000,
  });
}
