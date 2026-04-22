import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FarmstandRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  claimed_by: string | null;
  listed_by: string | null;
}

export function useFarmstandsMP() {
  return useQuery({
    queryKey: ["farmstands-mp"],
    queryFn: async (): Promise<FarmstandRow[]> => {
      const { data, error } = await supabase
        .from("farmstands")
        .select("id,name,description,image_url,location,latitude,longitude,claimed_by,listed_by")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as FarmstandRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
