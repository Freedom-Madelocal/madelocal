import { useLocation, useNavigate } from "react-router-dom";
import { Compass, Heart, Store, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", label: "Discover", icon: Compass },
  { path: "/following", label: "Following", icon: Heart },
  { path: "/sell", label: "Sell", icon: Store },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide when wrapped in native app shell
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("app") === "1") return null;

  // Hide on seller profile pages
  if (location.pathname.startsWith("/seller/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-1.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-2 right-2 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
