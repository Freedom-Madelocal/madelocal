// Loose database types — the Supabase backend (Tribekiller) has 100+ tables.
// Rather than mirror every table here, we type Database loosely so all
// .from("anything").select("*") queries compile. Runtime is fully validated by
// Supabase; we just lose autocomplete on column names. To get full typing back,
// regenerate from `supabase gen types typescript` against project ref kygqkcnrxxsauibhlvno.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tables<_T extends string = string> = any;
