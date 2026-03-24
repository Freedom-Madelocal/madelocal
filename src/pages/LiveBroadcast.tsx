import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLiveStream } from "@/hooks/use-live-stream";
import { useLiveComments } from "@/hooks/use-live-comments";
import { LiveComments } from "@/components/live/LiveComments";
import { EndStreamScreen } from "@/components/live/EndStreamScreen";
import { useProfile } from "@/hooks/use-profile";

export default function LiveBroadcast() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { stream, loading, createStream, endStream, saveRecording } = useLiveStream();
  const { comments, sendComment } = useLiveComments(stream?.id ?? null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const whipSessionRef = useRef<RTCPeerConnection | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [ended, setEnded] = useState(false);

  // Start camera preview
  useEffect(() => {
    let ms: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true })
      .then((mediaStream) => {
        ms = mediaStream;
        mediaStreamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(console.error);
    return () => {
      ms?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startBroadcast = useCallback(async () => {
    const data = await createStream();
    if (!data || !mediaStreamRef.current) return;

    // Use WHIP (WebRTC) ingest
    const pc = new RTCPeerConnection();
    whipSessionRef.current = pc;

    mediaStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, mediaStreamRef.current!);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      const res = await fetch(data.webrtc_url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      const answerSdp = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setBroadcasting(true);
    } catch (e) {
      console.error("WHIP negotiation failed:", e);
    }
  }, [createStream]);

  const handleEnd = useCallback(async () => {
    if (stream) await endStream(stream.id);
    whipSessionRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    setBroadcasting(false);
    setEnded(true);
  }, [stream, endStream]);

  const handleSave = useCallback(async () => {
    if (!stream) return null;
    return saveRecording(stream.id);
  }, [stream, saveRecording]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (ended) {
    return (
      <EndStreamScreen
        onSave={handleSave}
        onDiscard={() => navigate("/sell")}
        loading={loading}
      />
    );
  }

  return (
    <div className="relative flex h-[100dvh] flex-col bg-foreground">
      {/* Camera preview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Top overlay */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-2 rounded-full bg-card/70 px-3 py-1.5 backdrop-blur-md">
          <div className="h-2 w-2 rounded-full bg-live animate-pulse" />
          <span className="text-xs font-semibold text-foreground">
            {broadcasting ? "LIVE" : "Preview"}
          </span>
        </div>
        <span className="text-xs text-primary-foreground/70">
          {profile?.full_name || "You"}
        </span>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 mt-auto">
        {broadcasting && (
          <LiveComments comments={comments} onSend={sendComment} />
        )}

        <div className="flex items-center justify-center gap-4 px-4 pb-8 pt-3">
          {!broadcasting ? (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={startBroadcast}
                disabled={loading}
                size="lg"
                className="h-14 rounded-2xl bg-live px-8 text-base font-bold text-live-foreground hover:bg-live/90"
              >
                <Radio className="h-5 w-5" />
                {loading ? "Starting…" : "Go Live"}
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleEnd}
                size="lg"
                variant="destructive"
                className="h-14 rounded-2xl px-8 text-base font-bold"
              >
                <PhoneOff className="h-5 w-5" />
                End Stream
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
