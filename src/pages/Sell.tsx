import { motion } from "framer-motion";
import { Radio, Eye, Search, MousePointerClick, Users, Video } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const stats = [
  { label: "Profile Views", value: "1,247", icon: Eye, change: "+12%" },
  { label: "Search Appearances", value: "3,891", icon: Search, change: "+8%" },
  { label: "Contact Clicks", value: "342", icon: MousePointerClick, change: "+23%" },
  { label: "Followers", value: "234", icon: Users, change: "+5" },
];

export default function Sell() {
  const [available, setAvailable] = useState(true);
  const [liveDialogOpen, setLiveDialogOpen] = useState(false);

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
          >
            <Radio className="h-5 w-5" />
            Go Live
          </Button>
        </motion.div>

        {/* Analytics */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Analytics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-2xl border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-primary">{stat.change}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
