// Stripe publishable keys — safe to expose. Mode is read from app_settings.
export const STRIPE_KEYS = {
  test: "pk_test_51NvCJwCQiT5UlUzAd9OYWWMCo71gnErAF9ysNNVifsDY1krAiV7rJMqVMPnqjzGm4jJqdX4ztDQQ02OyIX2h7OoU00LBB3m8Ki",
  live: "pk_live_51NvCJwCQiT5UlUzAMLSepfUNCf5CDnNFrEPnSxLA8NlqkDgjucRN5BGrT366P7eqmVjsVsBcEts8rm7j7Inf9Wbj00v5LFrvUm",
} as const;

export type StripeMode = "test" | "live";

export const getStripePublishableKey = (mode: StripeMode): string => STRIPE_KEYS[mode];

const cache: Record<string, ReturnType<typeof import("@stripe/stripe-js")["loadStripe"]> | undefined> = {};

export const getStripePromise = async (mode: StripeMode) => {
  const key = getStripePublishableKey(mode);
  if (!cache[key]) {
    const { loadStripe } = await import("@stripe/stripe-js");
    cache[key] = loadStripe(key);
  }
  return cache[key]!;
};
