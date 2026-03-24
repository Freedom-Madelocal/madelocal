import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radio, Eye, Search, MousePointerClick, Users, Video } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSellerAnalytics } from "@/hooks/use-seller-analytics";
import { useAuth } from "@/hooks/use-auth";

interface Stat {
  label: string;
  value: string;
  icon: typeof Eye;
  change: string;
  description: string;
  extra?: { label: string; value: string };
}

const descriptions = {
  profileViews: "Tracks how many people spent longer than 2 seconds on your profile.",
  searchAppearances: "Shows how many times your profile or listing appeared in a search.",
  contactClicks: "Shows how many people clicked the button to get ahold of you. When marketplace settings are enabled, this metric becomes \"Transactions\".",
  followers: "Shows how many people are following you. Engaged followers interacted with your profile, listings, or videos in the last 30 days.",
};

function formatChange(pct: number): string {
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function buildStats(data: ReturnType<typeof useSellerAnalytics>["data"]): Stat[] {
  if (!data) {
    return [
      { label: "Profile Views", value: "--", icon: Eye, change: "", description: descriptions.profileViews },
      { label: "Search Appearances", value: "--", icon: Search, change: "", description: descriptions.searchAppearances },
      { label: "Contact Clicks", value: "--", icon: MousePointerClick, change: "", description: descriptions.contactClicks },
      { label: "Followers", value: "--", icon: Users, change: "", description: descriptions.followers },
    ];
  }

  return [
    { label: "Profile Views", value: data.profile_views.total_30d.toLocaleString(), icon: Eye, change: formatChange(data.profile_views.change_pct), description: descriptions.profileViews },
    { label: "Search Appearances", value: data.search_appearances.total_30d.toLocaleString(), icon: Search, change: formatChange(data.search_appearances.change_pct), description: descriptions.searchAppearances },
    { label: "Contact Clicks", value: data.contact_clicks.total_30d.toLocaleString(), icon: MousePointerClick, change: formatChange(data.contact_clicks.change_pct), description: descriptions.contactClicks },
    { label: "Followers", value: data.followers.total.toLocaleString(), icon: Users, change: "", description: descriptions.followers, extra: { label: "Engaged (30d)", value: data.followers.engaged_30d.toLocaleString() } },
  ];
}

export default function Sell() {
  const navigate = useNavigate();
  const [available, setAvailable] = useState(true);
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null);
  const { user } = useAuth();
  const { data: analytics, isLoading } = useSellerAnalytics();

  const stats = buildStats(analytics);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Seller Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your listings
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-2">
        {/* Availability */}
        <Card className="rounded-2xl border">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="font-semibold text-foreground">Available Now</p>
              <p className="text-sm text-muted-foreground">
                {available ? "Buyers can see you" : "You're hidden from search"}
              </p>
            </div>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </CardContent>
        </Card>

        {/* Go Live */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="w-full rounded-2xl bg-live text-live-foreground hover:bg-live/90 h-14 text-base font-semibold"
            onClick={() => navigate("/live/broadcast")}
          >
            <Radio className="h-5 w-5" />
            Go Live
          </Button>
        </motion.div>

        <Dialog open={liveDialogOpen} onOpenChange={setLiveDialogOpen}>
          <DialogContent className="rounded-2xl max-w-sm mx-auto">
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl">Coming Soon</DialogTitle>
              <DialogDescription className="text-center text-sm leading-relaxed">
                Live streaming is on its way — a new way to deepen your connection with buyers and the community. Take them along your bakes, tour your coop, and more. We believe that our connection to food and each other is vital for our health and community.
              </DialogDescription>
            </DialogHeader>
            <Button className="w-full rounded-xl mt-2" onClick={() => setLiveDialogOpen(false)}>
              Got It
            </Button>
          </DialogContent>
        </Dialog>

        {/* Analytics */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Analytics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="rounded-2xl border">
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))
              : stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className="rounded-2xl border cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedStat(stat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                          {stat.change && (
                            <span className="text-xs font-medium text-primary">{stat.change}</span>
                          )}
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </div>

        {/* Stat Detail Dialog */}
        <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
          <DialogContent className="rounded-2xl max-w-sm mx-auto">
            <DialogHeader className="space-y-3">
              {selectedStat && (
                <>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <selectedStat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <DialogTitle className="text-center text-xl">{selectedStat.label}</DialogTitle>
                  <p className="text-center text-3xl font-bold text-foreground">{selectedStat.value}</p>
                  <DialogDescription className="text-center text-sm leading-relaxed">
                    {selectedStat.description}
                  </DialogDescription>
                  {selectedStat.extra && (
                    <div className="rounded-xl bg-muted/50 p-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{selectedStat.extra.label}</span>
                      <span className="text-lg font-bold text-foreground">{selectedStat.extra.value}</span>
                    </div>
                  )}
                </>
              )}
            </DialogHeader>
            <Button className="w-full rounded-xl mt-2" onClick={() => setSelectedStat(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
