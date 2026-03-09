import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSellers } from "@/hooks/use-sellers";

export default function Following() {
  const navigate = useNavigate();
  const { data: sellers = [], isLoading } = useSellers();

  // Show recently updated listings as a feed
  const recentUpdates = sellers
    .flatMap((seller) =>
      seller.listings.map((listing) => ({
        sellerId: seller.user_id,
        sellerName: seller.name,
        sellerPhoto: seller.avatar_url || listing.image_url || "",
        listingTitle: listing.title,
        updatedAt: listing.updated_at,
        isActive: listing.is_active,
      }))
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Following
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Recent updates from sellers
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4">
        {isLoading && (
          <div className="py-16 text-center text-muted-foreground">
            <p>Loading updates...</p>
          </div>
        )}
        <div className="space-y-3 pt-2">
          {recentUpdates.map((update, i) => (
            <motion.div
              key={`${update.sellerId}-${update.listingTitle}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/seller/${update.sellerId}`)}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/50 active:scale-[0.99]"
            >
              {update.sellerPhoto && (
                <img
                  src={update.sellerPhoto}
                  alt={update.sellerName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-foreground">{update.sellerName}</span>{" "}
                  <span className="text-muted-foreground">
                    {update.isActive ? "listed" : "removed"} {update.listingTitle}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(update.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Package className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
          {!isLoading && recentUpdates.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p>No recent updates</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
