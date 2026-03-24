import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Download, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EndStreamScreenProps {
  onSave: () => Promise<{ download_url: string; playback_id: string } | null>;
  onDiscard: () => void;
  loading?: boolean;
}

export function EndStreamScreen({ onSave, onDiscard, loading }: EndStreamScreenProps) {
  const [saved, setSaved] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSave = async () => {
    const result = await onSave();
    if (result) {
      setSaved(true);
      setDownloadUrl(result.download_url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Stream Ended</h1>
        <p className="mt-1 text-sm text-muted-foreground">What would you like to do with this video?</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {!saved ? (
          <>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-semibold"
            >
              <Save className="h-5 w-5" />
              {loading ? "Saving…" : "Save & Pin to Profile"}
            </Button>
            <Button
              onClick={onDiscard}
              variant="outline"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base"
            >
              <Trash2 className="h-5 w-5" />
              Discard
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-sm font-medium text-primary">Video saved & pinned to your profile!</p>
            {downloadUrl && (
              <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold" variant="outline">
                <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-5 w-5" />
                  Download Video
                </a>
              </Button>
            )}
            <Button onClick={onDiscard} variant="ghost" className="w-full rounded-2xl">
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
