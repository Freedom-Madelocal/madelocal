import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Truck, AlertCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketplaceListingRow } from "@/hooks/use-marketplace-listings";

interface Props {
  row: MarketplaceListingRow;
  distance?: number | null;
  index?: number;
}

const formatDistance = (d: number | null | undefined): string | null => {
  if (d == null) return null;
  if (d < 1) return `${d.toFixed(1)} mi`;
  return `${Math.round(d)} mi`;
};

export function ListingCard({ row, distance, index = 0 }: Props) {
  const sellerName =
    row.public_profiles?.shop_name ||
    row.public_profiles?.full_name?.split(" ")[0] ||
    "Local Seller";
  const avatar =
    row.public_profiles?.shop_avatar_url ||
    row.public_profiles?.avatar_url ||
    "/placeholder.svg";
  const image = row.images?.[0] || "/placeholder.svg";
  const isLimited = row.listing_types?.inventory_type === "limited";
  const isLowStock = isLimited && row.stock_count != null && row.stock_count <= 3 && row.stock_count > 0;
  const offersDelivery = row.public_profiles?.delivery_price != null;
  const distLabel = formatDistance(distance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/listing/${row.id}`}
        className="block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img
            src={image}
            alt={row.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {row.is_unclaimed && (
            <Badge variant="secondary" className="absolute left-2 top-2 bg-background/90 text-xs">
              Unclaimed
            </Badge>
          )}
          {isLimited && row.stock_count != null && (
            <Badge
              className={cn(
                "absolute right-2 top-2 gap-1 text-xs",
                isLowStock
                  ? "bg-amber-500 text-white hover:bg-amber-500"
                  : "bg-background/90 text-foreground hover:bg-background/90"
              )}
            >
              {isLowStock ? <AlertCircle className="h-3 w-3" /> : <Package className="h-3 w-3" />}
              {row.stock_count} left
            </Badge>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{row.title}</h3>
            <span className="shrink-0 font-display text-base font-bold text-primary">
              ${Number(row.price).toFixed(0)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <img
              src={avatar}
              alt={sellerName}
              className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
            />
            <span className="truncate text-xs text-muted-foreground">{sellerName}</span>
            {distLabel && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {distLabel}
                </span>
              </>
            )}
          </div>

          {offersDelivery && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-primary">
              <Truck className="h-3 w-3" />
              Delivery available
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
