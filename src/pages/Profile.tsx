import { motion } from "framer-motion";
import { Settings, ChevronRight, Heart, Crown, Bell, MapPin, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { label: "Saved Sellers", icon: Heart, badge: "12" },
  { label: "Notifications", icon: Bell },
  { label: "Location Settings", icon: MapPin },
  { label: "Account Settings", icon: Settings },
  { label: "Sign Out", icon: LogOut },
];

export default function Profile() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-2">
        {/* User Info */}
        <Card className="rounded-2xl border">
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar className="h-14 w-14">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">Jordan Davis</p>
              <p className="text-sm text-muted-foreground">Granbury, TX</p>
            </div>
          </CardContent>
        </Card>

        {/* Premium Card */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-primary to-primary/80">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary-foreground">Support Local</p>
                <p className="text-sm text-primary-foreground/80">
                  Get premium features & support local sellers
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary-foreground/60" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu */}
        <Card className="overflow-hidden rounded-2xl border">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 border-b last:border-0 p-4 transition-colors hover:bg-accent/50"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </Card>
      </main>
    </div>
  );
}
