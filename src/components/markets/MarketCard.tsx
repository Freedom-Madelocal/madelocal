import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import type { FarmersMarketRow } from "@/hooks/use-farmers-markets-mp";

interface Props {
  row: FarmersMarketRow;
  distance?: number | null;
  index?: number;
}

const fmt = (d: number | null | undefined) =>
  d == null ? null : d < 1 ? `${d.toFixed(1)} mi` : `${Math.round(d)} mi`;

export function MarketCard({ row, distance, index = 0 }: Props) {
  const distLabel = fmt(distance);
  // Try to render a short schedule blurb
  let scheduleBlurb: string | null = null;
  try {
    const sched = Array.isArray(row.schedule) ? row.schedule : [];
    if (sched.length) {
      scheduleBlurb = sched.map((s: any) => s.day?.slice(0, 3)).filter(Boolean).join(", ");
    }
  } catch { /* noop */ }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/market/${row.slug}`}
        className="flex gap-3 overflow-hidden rounded-2xl border bg-card p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {row.logo_url ? (
            <img src={row.logo_url} alt={row.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <MapPin className="h-8 w-8 text-primary/60" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{row.name}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {row.city}, {row.state}
          </p>
          {scheduleBlurb && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="truncate">{scheduleBlurb}</span>
            </div>
          )}
          {distLabel && <div className="mt-1 text-xs text-primary">{distLabel} away</div>}
        </div>
      </Link>
    </motion.div>
  );
}
