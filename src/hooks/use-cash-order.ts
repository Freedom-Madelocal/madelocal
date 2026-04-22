import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CashCartItem {
  listing_id: string;
  title: string;
  price: number;
  quantity: number;
  seller_id: string;
}

interface Params {
  cartItems: CashCartItem[];
  userId: string;
}

async function placeCashOrder({ cartItems, userId }: Params) {
  for (const item of cartItems) {
    const itemTotal = item.price * item.quantity;
    const { error } = await supabase.from("transactions").insert({
      amount: itemTotal,
      final_amount: itemTotal,
      buyer_id: userId,
      seller_id: item.seller_id,
      listing_id: item.listing_id,
      status: "pending_payment",
      payment_method: "cash",
      platform_fee: 0,
    } as any);
    if (error) throw new Error("Failed to create cash order");
  }
}

export function useCashOrder() {
  return useMutation({ mutationFn: placeCashOrder });
}
