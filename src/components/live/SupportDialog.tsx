import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const presets = [1, 5, 10, 25];

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string | null;
  sellerName: string;
}

export function SupportDialog({ open, onOpenChange, streamId, sellerName }: SupportDialogProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(5);
  const [custom, setCustom] = useState("");
  const [sending, setSending] = useState(false);

  const amount = selected ?? (custom ? parseFloat(custom) : 0);

  const handleSend = async () => {
    if (!streamId || !user || !amount || amount <= 0) return;
    setSending(true);
    try {
      await supabase.functions.invoke("create-tip", {
        body: { stream_id: streamId, amount_cents: Math.round(amount * 100) },
      });
      toast.success(`Thank you for supporting ${sellerName}!`);
      onOpenChange(false);
    } catch {
      toast.error("Could not send support. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-sm rounded-3xl border-0 bg-card p-0 shadow-2xl overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pb-5 pt-6 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm"
          >
            <Heart className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <h2 className="text-lg font-bold text-primary-foreground">Support {sellerName}</h2>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(""); }}
                className={cn(
                  "rounded-xl py-2.5 text-sm font-semibold transition-all",
                  selected === amt
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-foreground hover:bg-accent"
                )}
              >
                ${amt}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">$</span>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              placeholder="Other amount"
              className="h-11 rounded-xl pl-7 text-sm"
            />
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            This is not an exchange for goods — just supporting the seller's efforts.
          </p>

          {/* Confirm */}
          <Button
            onClick={handleSend}
            disabled={!amount || amount <= 0 || sending}
            className="h-12 w-full rounded-2xl bg-foreground text-background text-base font-semibold hover:bg-foreground/90"
          >
            {sending ? "Sending…" : `Support $${amount.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
