export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      buyer_categories: {
        Row: { category_id: string; id: string; user_id: string }
        Insert: { category_id: string; id?: string; user_id: string }
        Update: { category_id?: string; id?: string; user_id?: string }
        Relationships: []
      }
      categories: {
        Row: { created_at: string; icon: string | null; id: string; name: string }
        Insert: { created_at?: string; icon?: string | null; id?: string; name: string }
        Update: { created_at?: string; icon?: string | null; id?: string; name?: string }
        Relationships: []
      }
      conversations: {
        Row: { buyer_id: string; created_at: string; id: string; listing_id: string | null; seller_id: string; updated_at: string }
        Insert: { buyer_id: string; created_at?: string; id?: string; listing_id?: string | null; seller_id: string; updated_at?: string }
        Update: { buyer_id?: string; created_at?: string; id?: string; listing_id?: string | null; seller_id?: string; updated_at?: string }
        Relationships: []
      }
      listings: {
        Row: { category_id: string; created_at: string; description: string | null; id: string; image_url: string | null; is_active: boolean | null; price: number | null; seller_id: string; title: string; updated_at: string }
        Insert: { category_id: string; created_at?: string; description?: string | null; id?: string; image_url?: string | null; is_active?: boolean | null; price?: number | null; seller_id: string; title: string; updated_at?: string }
        Update: { category_id?: string; created_at?: string; description?: string | null; id?: string; image_url?: string | null; is_active?: boolean | null; price?: number | null; seller_id?: string; title?: string; updated_at?: string }
        Relationships: []
      }
      messages: {
        Row: { content: string; conversation_id: string; created_at: string; id: string; is_address: boolean | null; sender_id: string }
        Insert: { content: string; conversation_id: string; created_at?: string; id?: string; is_address?: boolean | null; sender_id: string }
        Update: { content?: string; conversation_id?: string; created_at?: string; id?: string; is_address?: boolean | null; sender_id?: string }
        Relationships: []
      }
      profiles: {
        Row: { address: string | null; avatar_url: string | null; bio: string | null; created_at: string; email: string | null; id: string; latitude: number | null; longitude: number | null; name: string; phone: string | null; role: "buyer" | "seller" | "both"; sms_consent: boolean | null; updated_at: string; user_id: string; venmo_link: string | null }
        Insert: { address?: string | null; avatar_url?: string | null; bio?: string | null; created_at?: string; email?: string | null; id?: string; latitude?: number | null; longitude?: number | null; name: string; phone?: string | null; role?: "buyer" | "seller" | "both"; sms_consent?: boolean | null; updated_at?: string; user_id: string; venmo_link?: string | null }
        Update: { address?: string | null; avatar_url?: string | null; bio?: string | null; created_at?: string; email?: string | null; id?: string; latitude?: number | null; longitude?: number | null; name?: string; phone?: string | null; role?: "buyer" | "seller" | "both"; sms_consent?: boolean | null; updated_at?: string; user_id?: string; venmo_link?: string | null }
        Relationships: []
      }
      user_roles: {
        Row: { id: string; role: "buyer" | "seller" | "both"; user_id: string }
        Insert: { id?: string; role: "buyer" | "seller" | "both"; user_id: string }
        Update: { id?: string; role?: "buyer" | "seller" | "both"; user_id?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      app_role: "buyer" | "seller" | "both"
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
