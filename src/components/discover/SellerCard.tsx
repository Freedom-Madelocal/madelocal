import { MapPin, Heart, BadgeCheck, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { SellerWithListings } from "@/hooks/use-sellers";

interface SellerCardProps {
  seller: SellerWithListings;
  index: number;
}

export function SellerCard({ seller, index }: SellerCardProps) {
  const navigate = useNavigate();
  const hasActiveListings = seller.listings.some((l) => l.is_active);
  const photo = seller.avatar_url || seller.listings.find((l) => l.image_url)?.image_url || "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/seller/${seller.user_id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={photo}
          alt={seller.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!hasActiveListings && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <span className="rounded-full bg-card px-4 py-1.5 text-sm font-medium text-foreground">
              Unavailable
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-foreground">
                {seller.name}
              </h3>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {seller.categoryName || seller.bio?.slice(0, 50) || "Local seller"}
            </p>
          </div>
          <div className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            hasActiveListings
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {hasActiveListings ? "Open" : "Closed"}
          </div>
        </div>

        {seller.listings.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {seller.listings.filter((l) => l.is_active).length} active listing{seller.listings.filter((l) => l.is_active).length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}
