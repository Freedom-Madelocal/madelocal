import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-sellers";

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

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
        <span>All</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selected === cat.slug
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
