import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FarmstandRow } from "@/hooks/use-farmstands-mp";

interface Props {
  row: FarmstandRow;
  distance?: number | null;
  index?: number;
}

const fmt = (d: number | null | undefined) =>
  d == null ? null : d < 1 ? `${d.toFixed(1)} mi` : `${Math.round(d)} mi`;

export function FarmstandCard({ row, distance, index = 0 }: Props) {
  const distLabel = fmt(distance);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/farmstand/${row.id}`}
        className="block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <Sprout className="h-10 w-10 text-primary/60" />
            </div>
          )}
          {!row.claimed_by && (
            <Badge variant="secondary" className="absolute left-2 top-2 bg-background/90 text-xs">
              Unclaimed
            </Badge>
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{row.name}</h3>
          {row.location && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{row.location}</span>
            </div>
          )}
          {distLabel && <div className="mt-1 text-xs text-primary">{distLabel} away</div>}
        </div>
      </Link>
    </motion.div>
  );
}
