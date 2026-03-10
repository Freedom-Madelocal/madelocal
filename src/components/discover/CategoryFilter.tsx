import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-sellers";

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const categoryEmojis: Record<string, string> = {
  eggs: "🥚",
  bread: "🍞",
  produce: "🥬",
  meat: "🥩",
  honey: "🍯",
  dairy: "🧀",
  "farm stands": "🏡",
  "honey and syrup": "🍯",
  "natural-products": "🌿",
  "baked-goods": "🍞",
  "jams-preserves": "🫙",
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
          selected === "all"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-secondary text-secondary-foreground hover:bg-accent"
        )}
      >
        <span>🌿</span>
        <span>All</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selected === cat
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          <span>{categoryEmojis[cat.toLowerCase()] || "📦"}</span>
          <span className="capitalize">{cat.replace(/-/g, " ")}</span>
        </button>
      ))}
    </div>
  );
}
