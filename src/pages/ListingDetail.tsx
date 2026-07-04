import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Plus, Minus, ShoppingCart, MapPin, Truck, AlertCircle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceListing } from "@/hooks/use-marketplace-listings";
import { addToCartLocal } from "@/hooks/use-cart-mp";
import { useAuth } from "@/hooks/use-auth";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: row, isLoading } = useMarketplaceListing(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">Listing not found.</p>
        <Link to="/" className="mt-4">
          <Button>Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const sellerName = row.public_profiles?.shop_name || row.public_profiles?.full_name || "Seller";
  const avatar = row.public_profiles?.shop_avatar_url || row.public_profiles?.avatar_url || "/placeholder.svg";
  const images = row.images && row.images.length ? row.images : ["/placeholder.svg"];
  const isLimited = row.listing_types?.inventory_type === "limited";
  const stockCount = row.stock_count ?? null;
  const isLowStock = isLimited && stockCount != null && stockCount <= 3 && stockCount > 0;
  const maxQty = isLimited && stockCount != null ? Math.max(stockCount, 1) : 99;
  const marketplaceEnabled = Number(row.price) > 0;
  const offersDelivery = row.public_profiles?.delivery_price != null;

  const handleAddToCart = () => {
    addToCartLocal(user?.id, row.id, quantity);
    toast({ title: "Added to cart", description: `${quantity}× ${row.title}` });
  };

  const handleBuyNow = () => {
    sessionStorage.setItem(
      "madelocal_mobile_checkout",
      JSON.stringify({
        cartItems: [{
          listing_id: row.id,
          title: row.title,
          price: Number(row.price),
          quantity,
          seller_id: row.seller_id,
          image: images[0],
          deliveryChoice: "pickup",
        }],
        subtotal: Number(row.price) * quantity,
        promoDiscount: 0,
        creditsApplied: 0,
        transactionFee: 0,
        transactionFeeLabel: null,
        deliveryFees: 0,
        deliveryBreakdown: [],
        sellerDeliveryInfo: [],
        allSellersAcceptCash: false,
        total: Number(row.price) * quantity,
      })
    );
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Back */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center px-3 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-lg">
        {/* Image */}
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <img src={images[0]} alt={row.title} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-5 p-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">{row.category}</Badge>
              {row.is_unclaimed && <Badge variant="outline" className="text-xs">Unclaimed</Badge>}
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{row.title}</h1>
            {row.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{row.location}</span>
              </div>
            )}
          </div>

          {/* Price + stock */}
          {marketplaceEnabled && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="font-display text-3xl font-bold text-primary">
                ${Number(row.price).toFixed(2)}
              </div>
              {isLimited && stockCount != null && (
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    isLowStock
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isLowStock ? <AlertCircle className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                  {stockCount} left
                </div>
              )}
              {offersDelivery && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Truck className="h-3.5 w-3.5" />
                  Delivery available
                </div>
              )}
            </div>
          )}

          {/* Seller card */}
          <Link
            to={`/seller/${row.seller_id}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <img src={avatar} alt={sellerName} className="h-11 w-11 rounded-full object-cover ring-2 ring-border" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{sellerName}</div>
              <div className="text-xs text-muted-foreground">View seller</div>
            </div>
            <Button variant="outline" size="sm">View shop</Button>
          </Link>

          {/* Description */}
          {row.description && (
            <div>
              <h2 className="mb-1 text-sm font-semibold text-foreground">About this item</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{row.description}</p>
            </div>
          )}

          {/* Quantity selector + buttons */}
          {marketplaceEnabled && (
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline" size="icon" className="h-8 w-8 rounded-full"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline" size="icon" className="h-8 w-8 rounded-full"
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur-xl safe-bottom">
        <div className="mx-auto flex max-w-lg gap-2">
          {marketplaceEnabled ? (
            <>
              <Button variant="outline" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add ${(Number(row.price) * quantity).toFixed(0)}
              </Button>
              <Button className="flex-1" onClick={handleBuyNow}>
                Buy now
              </Button>
            </>
          ) : (
            <Button
              className="flex-1"
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                navigate(`/seller/${row.seller_id}`);
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact seller
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
