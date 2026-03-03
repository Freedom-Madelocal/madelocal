import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BadgeCheck, Heart, MessageCircle, Radio,
  MapPin, ExternalLink, Navigation, Copy, Check,
} from "lucide-react";
import { useState } from "react";
import { mockSellers } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const seller = mockSellers.find((s) => s.id === id);
  const [following, setFollowing] = useState(false);
  const [showContact, setShowContact] = useState(false);

  if (!seller) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Seller not found</p>
      </div>
    );
  }

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
          src={seller.photo}
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

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-foreground">{seller.name}</h1>
            {seller.verified && <BadgeCheck className="h-5 w-5 text-primary-foreground" />}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/80">
            <MapPin className="h-3.5 w-3.5" />
            <span>{seller.distance} away</span>
            {seller.isPremium && (
              <Badge className="bg-premium text-premium-foreground border-0 text-xs">Premium</Badge>
            )}
          </div>
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
          <Button variant="outline" className="flex-1 rounded-xl">
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          {seller.isLive && (
            <Button className="flex-1 rounded-xl bg-live text-live-foreground hover:bg-live/90">
              <Radio className="h-4 w-4" />
              Watch Live
            </Button>
          )}
        </div>

        {/* About */}
        <section className="py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {seller.bio}
          </p>
        </section>

        {/* Products */}
        <section className="py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Products
          </h2>
          <div className="mt-3 space-y-2">
            {seller.products.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.price}</p>
                </div>
                <Badge
                  variant={product.available ? "default" : "secondary"}
                  className={cn(
                    "rounded-full",
                    product.available && "bg-primary/10 text-primary border-0"
                  )}
                >
                  {product.available ? "Available" : "Sold Out"}
                </Badge>
              </div>
            ))}
          </div>
        </section>

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
              <button
                onClick={() => handleCopy(seller.name, "Name")}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Copy Contact Info</span>
              </button>
              {seller.venmo && (
                <a
                  href={`https://venmo.com/${seller.venmo.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pay via Venmo</span>
                </a>
              )}
              <button
                onClick={() => toast.success("Opening directions...")}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
              >
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Get Directions</span>
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
