import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LiveComment } from "@/hooks/use-live-comments";

interface LiveCommentsProps {
  comments: LiveComment[];
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function LiveComments({ comments, onSend, disabled }: LiveCommentsProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex flex-col">
      {/* Comments feed */}
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-hide" style={{ maxHeight: "200px" }}>
        <AnimatePresence initial={false}>
          {comments.slice(-50).map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-foreground/10 px-2.5 py-1.5 backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-primary">{c.user_name} </span>
              <span className="text-xs text-foreground">{c.content}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-3 pb-3 pt-1">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something…"
          disabled={disabled}
          className="h-9 rounded-full bg-card/80 text-sm backdrop-blur-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !text.trim()}
          className="h-9 w-9 shrink-0 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
