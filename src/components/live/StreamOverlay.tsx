import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface StreamOverlayProps {
  sellerId: string;
  sellerName: string;
  avatarUrl?: string;
  rating?: number;
  isLive?: boolean;
}

export function StreamOverlay({ sellerId, sellerName, avatarUrl, rating, isLive }: StreamOverlayProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/seller/${sellerId}`)}
      className="flex items-center gap-2.5 rounded-2xl bg-card/80 px-3 py-2 backdrop-blur-md transition-colors hover:bg-card/90"
    >
      <Avatar className="h-9 w-9 border-2 border-primary/30">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {sellerName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{sellerName}</span>
          {isLive && (
            <span className="rounded-full bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-live-foreground">
              Live
            </span>
          )}
        </div>
        {rating != null && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(rating) ? "fill-premium text-premium" : "text-muted-foreground/30"}`}
              />
            ))}
            <span className="ml-0.5 text-[10px] text-muted-foreground">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
}
