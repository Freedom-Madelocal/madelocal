import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart-mp";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeItem, subtotal } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const allCash = cartItems.every(i => i.listing.seller?.accepts_cash_on_pickup);
    sessionStorage.setItem(
      "madelocal_mobile_checkout",
      JSON.stringify({
        cartItems: cartItems.map(i => ({
          listing_id: i.listing.id,
          title: i.listing.title,
          price: i.listing.price,
          quantity: i.quantity,
          seller_id: i.listing.seller_id,
          image: i.listing.images?.[0],
          deliveryChoice: "pickup",
        })),
        subtotal,
        promoDiscount: 0,
        creditsApplied: 0,
        transactionFee: 0,
        transactionFeeLabel: null,
        deliveryFees: 0,
        deliveryBreakdown: [],
        sellerDeliveryInfo: [],
        allSellersAcceptCash: allCash,
        total: subtotal,
      })
    );
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">Cart</h1>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4">
        {cartItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">Your cart is empty</p>
            <Button onClick={() => navigate("/")} className="mt-4">Start shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.listing.id} className="flex gap-3 rounded-2xl border bg-card p-3">
                <img
                  src={item.listing.images?.[0] || "/placeholder.svg"}
                  alt={item.listing.title}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold text-foreground">
                    {item.listing.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.listing.seller?.shop_name || item.listing.seller?.full_name || "Seller"}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.listing.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.listing.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-display text-base font-bold text-primary">
                      ${(item.listing.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground"
                  onClick={() => removeItem(item.listing.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur-xl safe-bottom">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Subtotal</div>
              <div className="font-display text-lg font-bold text-foreground">${subtotal.toFixed(2)}</div>
            </div>
            <Button size="lg" className="flex-1" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
