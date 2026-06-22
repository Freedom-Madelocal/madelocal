import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SellerSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const profileUrl = user
    ? `https://madelocal.app/seller/${user.id}`
    : `https://madelocal.app`;

  useEffect(() => {
    const gold = ['#CFB53B', '#FFD700', '#FFC72C', '#B8860B'];
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: gold });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: gold });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ title: "Link copied 🎉" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: profileUrl, variant: "destructive" });
    }
  };

  const share = async () => {
    const text = `Check out my shop on MadeLocal — fresh food from your neighbors!\n${profileUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My MadeLocal shop', text, url: profileUrl });
        return;
      } catch {
        /* user dismissed */
      }
    }
    copyLink();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-6 text-6xl"
      >
        🎉
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-3 text-3xl font-bold text-foreground"
      >
        You're live!
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-xs text-muted-foreground"
      >
        Your first listing is published. Share your shop with neighbors to get your first sale.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <Button onClick={share} size="lg" className="h-14 rounded-2xl text-base font-semibold shadow-lg">
          Share my shop
        </Button>
        <Button onClick={copyLink} variant="outline" size="lg" className="h-14 rounded-2xl text-base font-semibold">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy profile link'}
        </Button>
        <Button onClick={() => navigate('/discover', { replace: true })} variant="ghost" size="lg" className="h-14 rounded-2xl text-base font-semibold">
          Go to my feed
        </Button>
      </motion.div>
    </div>
  );
}
