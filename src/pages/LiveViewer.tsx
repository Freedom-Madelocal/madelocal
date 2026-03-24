import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MuxPlayer from "@mux/mux-player-react";
import { Share2, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StreamOverlay } from "@/components/live/StreamOverlay";
import { LiveComments } from "@/components/live/LiveComments";
import { SupportDialog } from "@/components/live/SupportDialog";
import { useLiveStream, type StreamStatus } from "@/hooks/use-live-stream";
import { useLiveComments } from "@/hooks/use-live-comments";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LiveViewer() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { getStreamStatus } = useLiveStream();
  const [status, setStatus] = useState<StreamStatus | null>(null);
  const [sellerInfo, setSellerInfo] = useState<{ name: string; avatar_url?: string; rating?: number }>({ name: "Seller" });
  const [supportOpen, setSupportOpen] = useState(false);
  const { comments, sendComment } = useLiveComments(status?.id ?? null);

  useEffect(() => {
    if (!sellerId) return;
    getStreamStatus(sellerId).then(setStatus);

    // Fetch seller profile
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", sellerId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSellerInfo({
            name: data.name || "Seller",
            avatar_url: data.avatar_url ?? undefined,
          });
        }
      });
  }, [sellerId, getStreamStatus]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${sellerInfo.name} is Live!`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  if (!status || !status.mux_playback_id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-lg font-semibold text-foreground">This seller isn't live right now</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] flex-col bg-foreground">
      {/* Mux Player */}
      <MuxPlayer
        streamType="live"
        playbackId={status.mux_playback_id}
        autoPlay="muted"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ "--media-object-fit": "cover" } as any}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 backdrop-blur-md"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <StreamOverlay
          sellerId={sellerId!}
          sellerName={sellerInfo.name}
          avatarUrl={sellerInfo.avatar_url}
          rating={sellerInfo.rating}
          isLive
        />

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 backdrop-blur-md"
          >
            <Share2 className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Bottom area */}
      <div className="relative z-10 mt-auto">
        <LiveComments comments={comments} onSend={sendComment} />

        <div className="flex items-center justify-center px-4 pb-8">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setSupportOpen(true)}
              className="h-12 rounded-2xl bg-primary/90 px-6 text-sm font-semibold text-primary-foreground backdrop-blur-sm hover:bg-primary"
            >
              <Heart className="h-4 w-4" />
              Support
            </Button>
          </motion.div>
        </div>
      </div>

      <SupportDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        streamId={status.id}
        sellerName={sellerInfo.name}
      />
    </div>
  );
}
