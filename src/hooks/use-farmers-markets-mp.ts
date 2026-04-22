import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FarmersMarketRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number;
  longitude: number;
  logo_url: string | null;
  schedule: any;
  rain_or_shine: boolean;
  website_url: string | null;
  phone: string | null;
}

export function useFarmersMarketsMP() {
  return useQuery({
    queryKey: ["farmers-markets-mp"],
    queryFn: async (): Promise<FarmersMarketRow[]> => {
      const { data, error } = await supabase
        .from("farmers_markets")
        .select("id,name,slug,description,address,city,state,zip_code,latitude,longitude,logo_url,schedule,rain_or_shine,website_url,phone")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as FarmersMarketRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
