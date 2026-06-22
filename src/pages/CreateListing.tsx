import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, X, ImagePlus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useMarketplaceCategories } from "@/hooks/use-categories-mp";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  title: z.string().trim().min(2, "Add a title").max(120),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().min(0, "Must be 0 or more").max(99999),
  category: z.string().min(1, "Pick a category"),
  location: z.string().trim().max(200).optional(),
});

export default function CreateListing() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isOnboarding = params.get('onboarding') === '1';
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: categories = [], isLoading: catsLoading } = useMarketplaceCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid image URL", variant: "destructive" });
      return;
    }
    setImageUrls((prev) => [...prev, url].slice(0, 5));
    setImageInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    const parsed = schema.safeParse({ title, description, price, category, location });
    if (!parsed.success) {
      toast({
        title: "Check your listing",
        description: parsed.error.issues[0]?.message ?? "Invalid input",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        seller_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        price: parsed.data.price,
        category: parsed.data.category,
        location: parsed.data.location || null,
        images: imageUrls.length ? imageUrls : null,
        is_active: true,
      };
      const { data: inserted, error } = await supabase
        .from("listings")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;

      await qc.invalidateQueries({ queryKey: ["seller", "listings-count", user.id] });
      await qc.invalidateQueries({ queryKey: ["marketplace", "listings", "active"] });
      toast({ title: "Listing published 🎉" });
      if (isOnboarding) {
        const newId = (inserted as { id?: string } | null)?.id ?? '';
        navigate(`/onboarding/pricing?listing=${newId}`, { replace: true });
      } else {
        navigate("/sell");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Couldn't publish", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isOnboarding ? navigate('/onboarding/card-prompt?after=skip-seller', { replace: true }) : navigate(-1)}
            className="rounded-full"
            aria-label={isOnboarding ? "Skip" : "Back"}
          >
            {isOnboarding ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
          <h1 className="font-display text-xl font-bold">
            {isOnboarding ? "Your first listing" : "New listing"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Heirloom tomatoes, 1 lb" maxLength={120} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          <p className="text-xs text-muted-foreground">Set to 0 for contact-only listings.</p>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={catsLoading}>
            <SelectTrigger>
              <SelectValue placeholder={catsLoading ? "Loading…" : "Pick one"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes it special?" rows={4} maxLength={2000} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Pickup location (optional)</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Neighborhood or city" maxLength={200} />
          <p className="text-xs text-muted-foreground">Never share a private address — buyers contact you privately.</p>
        </div>

        <div className="space-y-2">
          <Label>Photos (paste URLs, up to 5)</Label>
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://…"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
            />
            <Button type="button" variant="outline" size="icon" onClick={addImage} disabled={imageUrls.length >= 5}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageUrls.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              No photos yet — your listing will use a placeholder.
            </div>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="pt-2">
          <Button type="submit" size="lg" className="h-14 w-full rounded-2xl text-base font-semibold" disabled={submitting}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish listing"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
