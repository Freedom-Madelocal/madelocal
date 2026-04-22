import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Check, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isCash = params.get("payment_method") === "cash";

  // Clear residual checkout data
  useEffect(() => {
    sessionStorage.removeItem("madelocal_mobile_checkout");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-10">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Order confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks for shopping local. The seller has been notified.
        </p>

        {isCash && (
          <div className="mt-6 rounded-2xl border bg-card p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pay with cash at pickup</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bring cash for the full order amount when you meet the seller.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/profile")}>
            View profile
          </Button>
          <Link to="/" className="flex-1">
            <Button className="w-full">Keep shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
