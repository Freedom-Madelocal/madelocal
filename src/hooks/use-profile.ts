import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  address: string | null;
  venmo_link: string | null;
  role: "buyer" | "seller" | "both";
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
  });
}
