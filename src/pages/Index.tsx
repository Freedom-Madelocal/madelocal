import { useState, useMemo } from "react";
import { SearchBar } from "@/components/discover/SearchBar";
import { CategoryFilter } from "@/components/discover/CategoryFilter";
import { SellerCard } from "@/components/discover/SellerCard";
import { useSellers } from "@/hooks/use-sellers";
import { useUserLocation } from "@/hooks/use-location";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/logo-full.png";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { user } = useAuth();
  const { location, loading: locLoading, requestLocation } = useUserLocation();

  const { data: buyerCats } = useQuery({
    queryKey: ["buyer-categories", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("buyer_categories")
        .select("category_id")
        .eq("user_id", user!.id);
      return data?.map((r: any) => r.category_id) ?? [];
    },
  });

  const { data: sellers = [], isLoading } = useSellers(location, buyerCats);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      const matchesCategory =
        category === "all" ||
        s.listings.some((l) => l.category === category);
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.bio?.toLowerCase().includes(search.toLowerCase()) ||
        s.listings.some((l) =>
          l.title.toLowerCase().includes(search.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [search, category, sellers]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <img src={logoFull} alt="MadeLocal" className="h-16 object-contain" />
              <p className="mt-1 text-sm text-muted-foreground">
                Discover food near you
              </p>
            </div>
            <Button
              variant={location ? "secondary" : "outline"}
              size="sm"
              className="shrink-0 rounded-full gap-1.5"
              onClick={requestLocation}
              disabled={locLoading}
            >
              {locLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {location ? "Near me" : "Use location"}
            </Button>
          </div>
          <div className="mt-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="mt-3">
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4">
        <div className="grid gap-4 pt-2">
          {isLoading && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">Loading sellers...</p>
            </div>
          )}
          {!isLoading && filtered.map((seller, i) => (
            <SellerCard key={seller.id} seller={seller} index={i} />
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">No sellers found</p>
              <p className="mt-1 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
