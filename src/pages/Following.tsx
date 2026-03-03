import { motion } from "framer-motion";
import { Radio, Package, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockFeedUpdates } from "@/data/mock-data";
import { cn } from "@/lib/utils";

const typeIcons = {
  restock: Package,
  live: Radio,
  update: RefreshCw,
};

export default function Following() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Following
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Updates from your sellers
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4">
        <div className="space-y-3 pt-2">
          {mockFeedUpdates.map((update, i) => {
            const Icon = typeIcons[update.type];
            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/seller/${update.sellerId}`)}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/50 active:scale-[0.99]"
              >
                <img
                  src={update.sellerPhoto}
                  alt={update.sellerName}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{update.sellerName}</span>{" "}
                    <span className="text-muted-foreground">{update.message}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{update.timestamp}</p>
                </div>
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  update.type === "live" ? "bg-live/10 text-live" : "bg-accent text-accent-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
