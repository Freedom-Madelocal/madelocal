import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  selectedCategories: string[];
  location: { lat: number; lng: number } | null;
  onComplete: () => void;
}

export default function SignupForm({ selectedCategories, location, onComplete }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: name.trim() },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with phone, location, sms_consent
        await supabase.from("profiles").update({
          phone: phone.trim(),
          latitude: location?.lat,
          longitude: location?.lng,
          sms_consent: smsConsent,
        }).eq("user_id", authData.user.id);

        // Save category preferences
        if (selectedCategories.length > 0) {
          await supabase.from("buyer_categories").insert(
            selectedCategories.map(cat_id => ({
              user_id: authData.user!.id,
              category_id: cat_id,
            }))
          );
        }

        // Insert role
        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "buyer" as const,
        });
      }

      toast({ title: "Welcome to MadeLocal! 🌱" });
      onComplete();
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">Almost there!</h2>
        <p className="mb-1 text-center text-muted-foreground">Create your free account to browse local sellers</p>
        <p className="mb-8 text-center text-sm font-medium text-primary">✨ It's completely free to sign up</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-xl" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 rounded-xl" required />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-muted p-4">
            <Checkbox id="sms" checked={smsConsent} onCheckedChange={(checked) => setSmsConsent(checked === true)} className="mt-0.5" />
            <Label htmlFor="sms" className="text-sm leading-relaxed text-muted-foreground">
              I agree to receive SMS notifications about new listings and messages from sellers
            </Label>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full py-6 text-lg font-semibold shadow-lg">
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Join MadeLocal
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
