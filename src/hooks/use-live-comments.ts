import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface LiveComment {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  avatar_url?: string;
}

export function useLiveComments(streamId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<LiveComment[]>([]);

  useEffect(() => {
    if (!streamId) return;

    // Fetch existing comments
    supabase
      .from("live_comments")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("stream_id", streamId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) {
          setComments(
            data.map((c: any) => ({
              id: c.id,
              stream_id: c.stream_id,
              user_id: c.user_id,
              content: c.content,
              created_at: c.created_at,
              user_name: c.profiles?.name || "Viewer",
              avatar_url: c.profiles?.avatar_url,
            }))
          );
        }
      });

    // Subscribe to new comments
    const channel = supabase
      .channel(`live-comments-${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_comments", filter: `stream_id=eq.${streamId}` },
        async (payload) => {
          const newComment = payload.new as any;
          // Fetch profile for the new comment
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", newComment.user_id)
            .single();

          setComments((prev) => [
            ...prev,
            {
              id: newComment.id,
              stream_id: newComment.stream_id,
              user_id: newComment.user_id,
              content: newComment.content,
              created_at: newComment.created_at,
              user_name: profile?.name || "Viewer",
              avatar_url: profile?.avatar_url,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const sendComment = useCallback(
    async (content: string) => {
      if (!streamId || !user || !content.trim()) return;
      await supabase.from("live_comments").insert({
        stream_id: streamId,
        user_id: user.id,
        content: content.trim(),
      });
    },
    [streamId, user]
  );

  return { comments, sendComment };
}
