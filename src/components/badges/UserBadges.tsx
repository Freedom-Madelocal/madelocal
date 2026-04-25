import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UserBadge } from "@/hooks/use-user-badges";
import { useUserBadges } from "@/hooks/use-user-badges";

interface Props {
  /** Pass a userId to fetch, OR pass `badges` directly when batch-loaded. */
  userId?: string | null;
  badges?: UserBadge[];
  size?: "sm" | "md";
  max?: number;
  className?: string;
}

function badgeStyle(b: UserBadge): React.CSSProperties {
  const start = b.color || "#888";
  const end = b.color_end || start;
  return {
    background:
      start === end ? start : `linear-gradient(135deg, ${start}, ${end})`,
    color: "#fff",
  };
}

export function UserBadges({ userId, badges: passed, size = "sm", max, className }: Props) {
  const { data: fetched } = useUserBadges(passed ? null : userId);
  const badges = passed ?? fetched ?? [];
  if (badges.length === 0) return null;

  const visible = max ? badges.slice(0, max) : badges;
  const sizeClasses =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {visible.map((b) => {
          const pill = (
            <span
              key={b.id}
              style={badgeStyle(b)}
              className={cn(
                "inline-flex items-center rounded-full font-semibold leading-none shadow-sm whitespace-nowrap",
                sizeClasses
              )}
            >
              {b.text}
            </span>
          );
          if (!b.tooltip) return pill;
          return (
            <Tooltip key={b.id}>
              <TooltipTrigger asChild>{pill}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                {b.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
