import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingMode } from "@/hooks/useOnboarding";

interface Props {
  selectedCategories: string[];
  location: { lat: number; lng: number } | null;
  mode?: OnboardingMode;
  shopName?: string;
  referralCode?: string;
  setShopName?: (s: string) => void;
  setReferralCode?: (s: string) => void;
  onComplete: () => void;
}

export default function SignupForm({
  selectedCategories,
  location,
  mode = 'buyer',
  shopName: shopNameProp,
  referralCode: referralCodeProp,
  setShopName: setShopNameProp,
  setReferralCode: setReferralCodeProp,
  onComplete,
}: Props) {
  const [name, setName] = useState("");
  const [shopName, setShopNameLocal] = useState(shopNameProp ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [hasReferral, setHasReferral] = useState(!!referralCodeProp);
  const [referralCode, setReferralCodeLocal] = useState(referralCodeProp ?? "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isSeller = mode === 'seller';

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
          data: { full_name: name.trim() },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const profileUpdate: Record<string, unknown> = {
          full_name: name.trim(),
          phone: phone.trim(),
          sms_consent: smsConsent,
          sms_consent_at: smsConsent ? new Date().toISOString() : null,
          onboarding_completed: true,
          account_type: isSeller ? 'seller' : 'buyer',
        };
        if (isSeller && shopName.trim()) profileUpdate.shop_name = shopName.trim();
        if (referralCode.trim()) profileUpdate.referral_code = referralCode.trim();
        if (location) {
          profileUpdate.latitude = location.lat;
          profileUpdate.longitude = location.lng;
        }

        // Profile update (best-effort: silently ignore missing-column errors)
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate as never)
          .eq("id", authData.user.id);
        if (profileError && !/column .* does not exist/i.test(profileError.message)) {
          // log but don't block onboarding
          console.warn('profile update warning', profileError.message);
        }

        // Category preferences
        if (selectedCategories.length > 0) {
          await supabase.from("buyer_categories").insert(
            selectedCategories.map(cat_id => ({
              user_id: authData.user!.id,
              category_id: cat_id,
            }))
          );
        }

        // Role
        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: isSeller ? "seller" : "buyer",
        } as never);

        setShopNameProp?.(shopName.trim());
        setReferralCodeProp?.(referralCode.trim());
      }

      toast({ title: isSeller ? "Welcome! Let's set up your first listing 🌱" : "Welcome to MadeLocal! 🌱" });

      if (isSeller) {
        navigate('/sell/new?onboarding=1', { replace: true });
      } else {
        navigate('/onboarding/card-prompt', { replace: true });
        onComplete();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again";
      toast({ title: "Something went wrong", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">Almost there!</h2>
        <p className="mb-1 text-center text-muted-foreground">
          {isSeller ? "Create your free seller account" : "Create your free account to browse local sellers"}
        </p>
        <p className="mb-8 text-center text-sm font-medium text-primary">✨ It's completely free to sign up</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" required />
          </div>
          {isSeller && (
            <div>
              <Label htmlFor="shop">Shop name <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="shop"
                placeholder="e.g. Sunny Acres Farm"
                value={shopName}
                onChange={(e) => setShopNameLocal(e.target.value)}
                className="mt-1 rounded-xl"
                maxLength={80}
              />
            </div>
          )}
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

          <div className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="ref"
                checked={hasReferral}
                onCheckedChange={(checked) => setHasReferral(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="ref" className="text-sm leading-relaxed text-muted-foreground">
                I have a referral code
              </Label>
            </div>
            {hasReferral && (
              <Input
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCodeLocal(e.target.value.toUpperCase())}
                className="mt-3 rounded-xl"
                maxLength={32}
              />
            )}
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full py-6 text-lg font-semibold shadow-lg">
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSeller ? "Set up first listing" : "Join MadeLocal"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
