import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SUPABASE_URL = "https://kygqkcnrxxsauibhlvno.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Z3FrY25yeHhzYXVpYmhsdm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTUwNjEsImV4cCI6MjA4MDc5MTA2MX0.rXa0Vp9JHAv_Iqg1dvrEG387pnlO59HqtY0zv1WiY2M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
