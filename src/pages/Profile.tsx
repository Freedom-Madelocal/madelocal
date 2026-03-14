import { motion } from "framer-motion";
import { Settings, ChevronRight, Heart, Crown, Bell, MapPin, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useNavigate } from "react-router-dom";
import logoWhite from "@/assets/logo-full-white.png";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { label: "Update My Interests", icon: Sparkles, action: "interests" },
  { label: "Saved Sellers", icon: Heart, badge: "12" },
  { label: "Notifications", icon: Bell },
  { label: "Location Settings", icon: MapPin },
  { label: "Account Settings", icon: Settings },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const displayName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const location = profile?.address || "Set your location";

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
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-14 w-14">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{location}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        {profile?.bio && (
          <Card className="rounded-2xl border">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Premium Card */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-primary to-[hsl(var(--brand-dark))]">
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
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if ((item as any).action === "interests") handleUpdateInterests();
              }}
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
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="flex-1 text-left text-sm font-medium text-destructive">
              Sign Out
            </span>
          </button>
        </Card>

        {/* Footer logo */}
        <div className="flex justify-center pb-4 pt-2 opacity-30">
          <img src={logoWhite} alt="MadeLocal" className="h-5 invert" />
        </div>
      </main>
    </div>
  );
}
