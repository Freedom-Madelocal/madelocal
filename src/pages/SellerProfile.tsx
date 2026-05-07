import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Heart, MessageCircle,
  MapPin, ExternalLink, Navigation, Copy,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MuxPlayer from "@mux/mux-player-react";
import { useSellerById } from "@/hooks/use-sellers";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserBadges } from "@/components/badges/UserBadges";

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: seller, isLoading } = useSellerById(id);
  const [following, setFollowing] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Pinned video
  const { data: pinnedVideo } = useQuery({
    queryKey: ["pinned-video", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await (supabase.from("pinned_videos" as any) as any)
        .select("mux_playback_id, duration_seconds")
        .eq("seller_id", id)
        .maybeSingle();
      return data as { mux_playback_id: string; duration_seconds: number | null } | null;
    },
  });


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Seller not found</p>
      </div>
    );
  }

  const photo = seller.avatar_url || seller.listings.find((l) => l.images?.length)?.images[0] || "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Hero */}
      <div className="relative">
        <img
          src={photo}
          alt={seller.name}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <h1 className="text-2xl font-bold text-primary-foreground">{seller.name}</h1>
          {id && <UserBadges userId={id} size="md" />}
        </div>
      </div>

      {/* Actions */}
      <div className="mx-auto max-w-lg px-4">
        <div className="flex gap-2 py-4">
          <Button
            onClick={() => setFollowing(!following)}
            variant={following ? "default" : "outline"}
            className="flex-1 rounded-xl"
          >
            <Heart className={cn("h-4 w-4", following && "fill-current")} />
            {following ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setShowContact((v) => !v)}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        </div>

        {/* About */}
        {seller.bio && (
          <section className="py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {seller.bio}
            </p>
          </section>
        )}

        {/* Pinned Video */}
        {pinnedVideo?.mux_playback_id && (
          <section className="py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pinned Video
            </h2>
            <div className="mt-3 overflow-hidden rounded-2xl border">
              <MuxPlayer
                playbackId={pinnedVideo.mux_playback_id}
                streamType="on-demand"
                autoPlay={false}
                className="w-full aspect-video"
              />
            </div>
          </section>
        )}

        {/* Listings */}
        {seller.listings.length > 0 && (
          <section className="py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Listings
            </h2>
            <div className="mt-3 space-y-2">
              {seller.listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    {listing.images?.[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{listing.title}</p>
                      {listing.price != null && (
                        <p className="text-sm text-muted-foreground">
                          ${listing.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={listing.is_active ? "default" : "secondary"}
                    className={cn(
                      "rounded-full",
                      listing.is_active && "bg-primary/10 text-primary border-0"
                    )}
                  >
                    {listing.is_active ? "Available" : "Sold Out"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="pb-8 pt-4">
          <Button
            onClick={() => setShowContact(!showContact)}
            className="w-full rounded-xl"
            size="lg"
          >
            Contact {seller.name.split(" ")[0]}
          </Button>

          {showContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {seller.phone && (
                <a
                  href={`sms:${seller.phone}`}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Text {seller.phone}</span>
                </a>
              )}
              {seller.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email {seller.email}</span>
                </a>
              )}
              {(seller as any).contact_url && (
                <a
                  href={(seller as any).contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Open contact link</span>
                </a>
              )}
              {seller.venmo_link && (
                <a
                  href={seller.venmo_link.startsWith("http") ? seller.venmo_link : `https://venmo.com/${seller.venmo_link.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pay via Venmo</span>
                </a>
              )}
              {!seller.phone && !seller.email && !(seller as any).contact_url && !seller.venmo_link && (
                <button
                  onClick={() => handleCopy(seller.name, "Name")}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Copy seller name</span>
                </button>
              )}
            </motion.div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
