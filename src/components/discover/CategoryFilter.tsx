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
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selected === cat.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          <span>{cat.icon || categoryEmojis[cat.name.toLowerCase()] || "📦"}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
