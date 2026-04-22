import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { StripeMode } from "@/lib/stripe-config";

export function useStripeMode() {
  const [mode, setMode] = useState<StripeMode>("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "stripe_mode")
          .maybeSingle();
        const v = (data as any)?.value;
        const str = typeof v === "string" ? v : String(v ?? "");
        if (str === "test" || str === "live") setMode(str);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { mode, loading };
}
