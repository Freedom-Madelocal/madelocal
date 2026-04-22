/**
 * Mobile cart hook backed by localStorage.
 * Stores minimal { id, quantity } and enriches with full listing+seller data on load.
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface CartListing {
  id: string;
  title: string;
  price: number;
  images: string[] | null;
  seller_id: string;
  location?: string | null;
  seller?: {
    full_name: string | null;
    shop_name: string | null;
    delivery_price: number | null;
    delivery_min_qty: number | null;
    delivery_max_radius: number | null;
    accepts_cash_on_pickup: boolean | null;
  };
}

export interface CartItem {
  listing: CartListing;
  quantity: number;
}

interface StoredCartItem { id: string; quantity: number }

export const getCartKey = (userId?: string) =>
  userId ? `madelocal_mobile_cart_${userId}` : "madelocal_mobile_cart_guest";

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const previousUserId = useRef<string | undefined>(undefined);
  const key = getCartKey(user?.id);

  // Reset when user changes
  useEffect(() => {
    if (previousUserId.current !== undefined && previousUserId.current !== user?.id) {
      setCartItems([]);
      setLoading(true);
    }
    previousUserId.current = user?.id;
  }, [user?.id]);

  // Load + enrich
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = localStorage.getItem(key);
      if (!saved) { setLoading(false); return; }
      try {
        const ids = JSON.parse(saved) as StoredCartItem[];
        if (!ids.length) { setLoading(false); return; }
        const { data } = await supabase
          .from("listings")
          .select("id,title,price,images,seller_id,location,profiles!listings_seller_id_fkey(full_name,shop_name,delivery_price,delivery_min_qty,delivery_max_radius,accepts_cash_on_pickup)")
          .in("id", ids.map(c => c.id));
        if (cancelled) return;
        if (data) {
          const items: CartItem[] = ids
            .map(c => {
              const l = (data as any[]).find(x => x.id === c.id);
              if (!l) return null;
              return {
                listing: { ...l, seller: l.profiles } as CartListing,
                quantity: c.quantity,
              };
            })
            .filter(Boolean) as CartItem[];
          setCartItems(items);
        }
      } catch { /* noop */ }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [key]);

  // Persist
  useEffect(() => {
    if (loading) return;
    const data: StoredCartItem[] = cartItems.map(i => ({ id: i.listing.id, quantity: i.quantity }));
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cartItems, loading, key]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems(items =>
      items
        .map(i => i.listing.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(items => items.filter(i => i.listing.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(key);
    window.dispatchEvent(new Event("cart-updated"));
  }, [key]);

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.listing.price * i.quantity, 0);

  return { cartItems, loading, updateQuantity, removeItem, clearCart, itemCount, subtotal };
}

/** Helper to add to cart from outside the hook (e.g. ListingDetail). */
export function addToCartLocal(userId: string | undefined, listingId: string, quantity = 1) {
  const k = getCartKey(userId);
  const saved = localStorage.getItem(k);
  const items: StoredCartItem[] = saved ? JSON.parse(saved) : [];
  const existing = items.find(i => i.id === listingId);
  if (existing) existing.quantity += quantity;
  else items.push({ id: listingId, quantity });
  localStorage.setItem(k, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}
