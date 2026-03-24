import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface LiveStreamData {
  id: string;
  mux_live_stream_id: string;
  mux_playback_id: string;
  stream_key: string;
  webrtc_url: string;
  status: "idle" | "active" | "ended";
}

export interface StreamStatus {
  id: string;
  seller_id: string;
  mux_playback_id: string;
  status: string;
  started_at: string | null;
}

export function useLiveStream() {
  const { user } = useAuth();
  const [stream, setStream] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStream = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-live-stream");
      if (fnError) throw fnError;
      setStream(data as LiveStreamData);
      return data as LiveStreamData;
    } catch (e: any) {
      setError(e.message || "Failed to create stream");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const endStream = useCallback(async (streamId: string) => {
    setLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("end-live-stream", {
        body: { stream_id: streamId },
      });
      if (fnError) throw fnError;
      setStream((prev) => prev ? { ...prev, status: "ended" } : null);
    } catch (e: any) {
      setError(e.message || "Failed to end stream");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecording = useCallback(async (streamId: string) => {
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("save-stream-recording", {
        body: { stream_id: streamId },
      });
      if (fnError) throw fnError;
      return data as { download_url: string; playback_id: string };
    } catch (e: any) {
      setError(e.message || "Failed to save recording");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStreamStatus = useCallback(async (sellerId: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-stream-status", {
        body: { seller_id: sellerId },
      });
      if (fnError) throw fnError;
      return data as StreamStatus | null;
    } catch {
      return null;
    }
  }, []);

  return { stream, loading, error, createStream, endStream, saveRecording, getStreamStatus };
}
