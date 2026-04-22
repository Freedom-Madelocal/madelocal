import { cn } from "@/lib/utils";

export type Segment = "listings" | "farmstands" | "markets";

interface Props {
  value: Segment;
  onChange: (s: Segment) => void;
}

const opts: { id: Segment; label: string }[] = [
  { id: "listings", label: "Listings" },
  { id: "farmstands", label: "Farmstands" },
  { id: "markets", label: "Markets" },
];

export function SegmentToggle({ value, onChange }: Props) {
  return (
    <div className="flex w-full rounded-full bg-muted p-1">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            value === o.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
